import { Command } from 'commander';
import { IStartBridgeUseCase } from '../../../application/ports/in/start-bridge.port.js';
import { IManageConfigUseCase } from '../../../application/ports/in/manage-config.port.js';
import { Logger } from '../ui/logger.js';

export function createStatusCommand(
  bridgeUseCase: IStartBridgeUseCase,
  configUseCase: IManageConfigUseCase,
  getLang: () => Promise<string>
): Command {
  const cmd = new Command('status');
  cmd.description('Display figma-mcp bridge, plugin connection, and configuration status');

  cmd.action(async () => {
    const status = bridgeUseCase.getStatus();
    const configPath = configUseCase.getConfigPath();
    const entries = await configUseCase.list();
    const lang = await getLang();

    const patEntry = entries.find((e) => e.key === 'FIGMA_PAT');
    const patStatus = patEntry ? Logger.maskSecret(patEntry.value) : '(not configured)';

    Logger.printCard('FIGMA MCP SYSTEM STATUS', [
      ['CLI Language', lang],
      ['Bridge Status', status.connectedClients > 0 ? 'ONLINE (Figma Connected)' : 'IDLE (Waiting for Figma)'],
      ['WebSocket Port', status.port.toString()],
      ['Figma Clients', status.connectedClients.toString()],
      ['Figma Document', status.figmaDocumentName || '(none)'],
      ['Active Page', status.activePageName || '(none)'],
      ['Figma PAT Token', patStatus],
      ['Config Path', configPath],
    ]);
  });

  return cmd;
}
