import { BridgeStatus } from '../../../domain/models/bridge-protocol.js';

export interface IStartBridgeUseCase {
  execute(port?: number): Promise<{ port: number; status: BridgeStatus }>;
  stop(): Promise<void>;
  getStatus(): BridgeStatus;
}
