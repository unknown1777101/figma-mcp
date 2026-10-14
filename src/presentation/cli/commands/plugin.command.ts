import { Command } from 'commander';
import { IExportPluginUseCase } from '../../../application/ports/in/export-plugin.port.js';
import { Logger } from '../ui/logger.js';
import { getPluginHelp, formatDomainDoc } from '../ui/help/help-formatter.js';

export function createPluginCommand(
  pluginUseCase: IExportPluginUseCase,
  getLang: () => Promise<string>
): Command {
  const plugin = new Command('plugin');
  plugin.description('Export and inspect the Figma Desktop plugin bundle');

  plugin.helpInformation = () => {
    return formatDomainDoc(getPluginHelp('en'));
  };

  // export
  plugin
    .command('export [outputDir]')
    .aliases(['pack', 'bundle'])
    .description('Export ready-to-import Figma plugin files (manifest.json, code.js, ui.html)')
    .option('-p, --port <port>', 'Bridge port to set in ui.html', '9099')
    .action(async (outputDirArg?: string, options?: any) => {
      const targetDir = outputDirArg || './figma-plugin-dist';
      const port = options?.port ? parseInt(options.port, 10) : 9099;

      try {
        Logger.info(`Exporting Figma plugin to: ${targetDir}...`);
        const result = await pluginUseCase.execute(targetDir, port);

        Logger.success(`Plugin successfully exported to: ${result.destination}`);
        Logger.plain('Exported files:');
        for (const f of result.files) {
          Logger.plain(`  • ${f}`);
        }

        Logger.plain('\nHow to import into Figma:');
        Logger.plain('  1. Open Figma Desktop');
        Logger.plain('  2. Go to Plugins -> Development -> Import plugin from manifest...');
        Logger.plain(`  3. Select manifest.json inside: ${result.destination}`);
        Logger.plain('  4. Run the plugin and connect to your local figma-mcp bridge!\n');
      } catch (err: any) {
        Logger.error(`Plugin export failed: ${err.message}`);
        process.exitCode = 1;
      }
    });

  // info
  plugin
    .command('info')
    .aliases(['manifest'])
    .description('Display plugin manifest metadata and internal file paths')
    .action(async () => {
      try {
        const info = await pluginUseCase.getInfo();
        Logger.printCard('FIGMA PLUGIN INFO', [
          ['Name', info.name],
          ['Version', info.version],
          ['Default Port', info.defaultPort.toString()],
          ['Manifest Path', info.manifestPath],
        ]);
      } catch (err: any) {
        Logger.error(`Failed to get plugin info: ${err.message}`);
        process.exitCode = 1;
      }
    });

  plugin.action(() => {
    Logger.plain(formatDomainDoc(getPluginHelp('en')));
  });

  return plugin;
}
