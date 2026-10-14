import { IStartBridgeUseCase } from '../ports/in/start-bridge.port.js';
import { IFigmaBridge } from '../ports/out/bridge.port.js';
import { BridgeStatus } from '../../domain/models/bridge-protocol.js';

export class StartBridgeUseCase implements IStartBridgeUseCase {
  constructor(private readonly bridge: IFigmaBridge) {}

  async execute(port?: number): Promise<{ port: number; status: BridgeStatus }> {
    const targetPort = port || 9099;
    await this.bridge.start(targetPort);
    const status = this.bridge.getStatus();
    return { port: targetPort, status };
  }

  async stop(): Promise<void> {
    await this.bridge.stop();
  }

  getStatus(): BridgeStatus {
    return this.bridge.getStatus();
  }
}
