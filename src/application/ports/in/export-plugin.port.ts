export interface IExportPluginUseCase {
  execute(destinationDir: string, bridgePort?: number): Promise<{ destination: string; files: string[] }>;
  getInfo(): Promise<{ manifestPath: string; name: string; version: string; defaultPort: number }>;
}
