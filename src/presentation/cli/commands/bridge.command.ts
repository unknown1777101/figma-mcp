import { Command } from 'commander';
import { IStartBridgeUseCase } from '../../../application/ports/in/start-bridge.port.js';
import { Logger } from '../ui/logger.js';
import { getBridgeHelp, formatDomainDoc } from '../ui/help/help-formatter.js';
import { SupportedLanguage } from '../ui/help/types.js';

export function createBridgeCommand(
  useCase: IStartBridgeUseCase,
  getLang: () => Promise<string>
): Command {
  const cmd = new Command('bridge');
  cmd.aliases(['b', 'ws']);
  cmd.description('Start the local WebSocket bridge for Figma desktop plugin');
  cmd.option('-p, --port <number>', 'WebSocket port (default: 9099)', '9099');

  cmd.helpInformation = () => {
    return formatDomainDoc(getBridgeHelp('en'));
  };

  cmd.action(async (options) => {
    const port = parseInt(options.port, 10) || 9099;
    const lang = (await getLang()) as SupportedLanguage;

    Logger.info(
      lang === 'id'
        ? `Memulai WebSocket bridge server di port ${port}...`
        : `Starting WebSocket bridge server on port ${port}...`
    );

    try {
      await useCase.execute(port);

      Logger.success(
        lang === 'id'
          ? `Bridge aktif di ws://localhost:${port}`
          : `Bridge active at ws://localhost:${port}`
      );
      Logger.plain(
        lang === 'id'
          ? 'Buka Figma Desktop -> Plugins -> Development -> Figma MCP Bridge untuk menghubungkan canvas.'
          : 'Open Figma Desktop -> Plugins -> Development -> Figma MCP Bridge to connect canvas.'
      );
      Logger.plain('Press Ctrl+C to stop.');

      // Keep alive
      await new Promise(() => {});
    } catch (err: any) {
      Logger.error(err.message);
      process.exitCode = 1;
    }
  });

  return cmd;
}
