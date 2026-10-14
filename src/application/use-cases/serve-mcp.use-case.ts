import { IServeMcpUseCase } from '../ports/in/serve-mcp.port.js';
import { IMcpTransport } from '../ports/out/mcp-transport.port.js';

export class ServeMcpUseCase implements IServeMcpUseCase {
  constructor(private readonly transport: IMcpTransport) {}

  async execute(): Promise<void> {
    await this.transport.start();
  }

  async stop(): Promise<void> {
    await this.transport.stop();
  }
}
