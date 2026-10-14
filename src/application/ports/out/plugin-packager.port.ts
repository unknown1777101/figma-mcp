export interface ExportPluginOptions {
  destinationDir: string;
  bridgePort?: number;
}

export interface IPluginPackager {
  exportPlugin(options: ExportPluginOptions): Promise<{ destination: string; files: string[] }>;
  getPluginInfo(): Promise<{ manifestPath: string; name: string; version: string; defaultPort: number }>;
}
