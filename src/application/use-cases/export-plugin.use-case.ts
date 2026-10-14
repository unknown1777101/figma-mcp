import { IExportPluginUseCase } from '../ports/in/export-plugin.port.js';
import { IPluginPackager } from '../ports/out/plugin-packager.port.js';

export class ExportPluginUseCase implements IExportPluginUseCase {
  constructor(private readonly packager: IPluginPackager) {}

  async execute(destinationDir: string, bridgePort?: number): Promise<{ destination: string; files: string[] }> {
    return this.packager.exportPlugin({ destinationDir, bridgePort });
  }

  async getInfo(): Promise<{ manifestPath: string; name: string; version: string; defaultPort: number }> {
    return this.packager.getPluginInfo();
  }
}
