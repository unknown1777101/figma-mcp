/**
 * Bridge communication protocol definitions.
 * Zero external dependencies.
 */

export type BridgeAction =
  | 'PING'
  | 'PONG'
  | 'GET_STATUS'
  | 'GET_SELECTION'
  | 'CREATE_ELEMENT'
  | 'RENDER_LAYOUT'
  | 'EXPORT_NODE';

export interface BridgeRequest<T = unknown> {
  id: string;
  action: BridgeAction;
  payload?: T;
  timestamp: number;
}

export interface BridgeResponse<T = unknown> {
  id: string;
  action: BridgeAction;
  success: boolean;
  data?: T;
  error?: string;
  timestamp: number;
}

export interface BridgeStatus {
  connectedClients: number;
  pluginActive: boolean;
  pluginVersion?: string;
  figmaDocumentName?: string;
  activePageName?: string;
  port: number;
  uptimeSeconds: number;
}
