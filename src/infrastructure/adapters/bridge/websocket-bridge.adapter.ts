import { WebSocketServer, WebSocket } from 'ws';
import * as crypto from 'node:crypto';
import { IFigmaBridge } from '../../../application/ports/out/bridge.port.js';
import {
  BridgeAction,
  BridgeRequest,
  BridgeResponse,
  BridgeStatus
} from '../../../domain/models/bridge-protocol.js';
import {
  BridgeConnectionError,
  FigmaPluginTimeoutError,
  DomainError
} from '../../../domain/errors/domain-errors.js';

interface PendingRequest {
  action: BridgeAction;
  resolve: (value: any) => void;
  reject: (reason?: any) => void;
  timer: NodeJS.Timeout;
}

export class WebSocketBridgeAdapter implements IFigmaBridge {
  private wss: WebSocketServer | null = null;
  private clients: Set<WebSocket> = new Set();
  private pendingRequests: Map<string, PendingRequest> = new Map();
  private port: number = 9099;
  private startTime: number = Date.now();
  private pluginMetadata: {
    version?: string;
    documentName?: string;
    activePageName?: string;
  } = {};

  async start(port: number = 9099): Promise<void> {
    if (this.wss) {
      if (this.port === port) return;
      await this.stop();
    }

    this.port = port;
    this.startTime = Date.now();

    return new Promise((resolve, reject) => {
      try {
        this.wss = new WebSocketServer({ port: this.port });

        this.wss.on('listening', () => {
          resolve();
        });

        this.wss.on('error', (err) => {
          reject(new DomainError(`WebSocket bridge failed to start on port ${this.port}: ${err.message}`));
        });

        this.wss.on('connection', (ws: WebSocket) => {
          this.clients.add(ws);

          ws.on('message', (data: string | Buffer) => {
            this.handleIncomingMessage(data.toString());
          });

          ws.on('close', () => {
            this.clients.delete(ws);
          });

          ws.on('error', () => {
            this.clients.delete(ws);
          });
        });
      } catch (err: any) {
        reject(new DomainError(`Failed to initialize WebSocket server: ${err.message}`));
      }
    });
  }

  async stop(): Promise<void> {
    for (const [id, req] of this.pendingRequests.entries()) {
      clearTimeout(req.timer);
      req.reject(new BridgeConnectionError('Bridge server stopped'));
    }
    this.pendingRequests.clear();

    for (const ws of this.clients) {
      try {
        ws.terminate();
      } catch {}
    }
    this.clients.clear();

    if (this.wss) {
      await new Promise<void>((resolve) => {
        this.wss?.close(() => resolve());
      });
      this.wss = null;
    }
  }

  isConnected(): boolean {
    return this.clients.size > 0;
  }

  getStatus(): BridgeStatus {
    return {
      port: this.port,
      connectedClients: this.clients.size,
      pluginActive: this.clients.size > 0,
      pluginVersion: this.pluginMetadata.version,
      figmaDocumentName: this.pluginMetadata.documentName,
      activePageName: this.pluginMetadata.activePageName,
      uptimeSeconds: Math.floor((Date.now() - this.startTime) / 1000),
    };
  }

  async sendAction<TReq = unknown, TRes = unknown>(
    action: BridgeAction,
    payload?: TReq,
    timeoutMs: number = 30000
  ): Promise<TRes> {
    if (!this.isConnected()) {
      throw new BridgeConnectionError(
        'No active Figma Plugin connected. Open Figma, run the Figma MCP Bridge plugin, and try again.'
      );
    }

    const requestId = crypto.randomUUID();
    const req: BridgeRequest<TReq> = {
      id: requestId,
      action,
      payload,
      timestamp: Date.now(),
    };

    return new Promise<TRes>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pendingRequests.delete(requestId);
        reject(new FigmaPluginTimeoutError(action, timeoutMs));
      }, timeoutMs);

      this.pendingRequests.set(requestId, {
        action,
        resolve,
        reject,
        timer,
      });

      const serialized = JSON.stringify(req);
      let sentCount = 0;
      for (const client of this.clients) {
        if (client.readyState === WebSocket.OPEN) {
          client.send(serialized);
          sentCount++;
        }
      }

      if (sentCount === 0) {
        clearTimeout(timer);
        this.pendingRequests.delete(requestId);
        reject(new BridgeConnectionError('Failed to send action: All client sockets are disconnected'));
      }
    });
  }

  private handleIncomingMessage(rawMessage: string): void {
    try {
      const parsed: BridgeResponse = JSON.parse(rawMessage);

      // Metadata sync message
      if (parsed.action === 'GET_STATUS' && parsed.data) {
        const d = parsed.data as any;
        if (d.version) this.pluginMetadata.version = d.version;
        if (d.documentName) this.pluginMetadata.documentName = d.documentName;
        if (d.activePageName) this.pluginMetadata.activePageName = d.activePageName;
      }

      // Check if it correlates to a pending action request
      const pending = this.pendingRequests.get(parsed.id);
      if (pending) {
        clearTimeout(pending.timer);
        this.pendingRequests.delete(parsed.id);

        if (parsed.success) {
          pending.resolve(parsed.data);
        } else {
          pending.reject(new DomainError(parsed.error || `Action ${pending.action} failed in Figma`));
        }
      }
    } catch {
      // Ignore unparseable frames
    }
  }
}
