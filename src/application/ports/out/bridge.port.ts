import { BridgeStatus, BridgeAction } from '../../../domain/models/bridge-protocol.js';

export interface IFigmaBridge {
  start(port?: number): Promise<void>;
  stop(): Promise<void>;
  isConnected(): boolean;
  getStatus(): BridgeStatus;
  sendAction<TReq = unknown, TRes = unknown>(
    action: BridgeAction,
    payload?: TReq,
    timeoutMs?: number
  ): Promise<TRes>;
}
