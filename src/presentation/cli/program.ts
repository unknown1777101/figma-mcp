import { Command } from 'commander';
import { AesCryptoService } from '../../infrastructure/adapters/crypto/aes-crypto.service.js';
import { FileConfigRepository } from '../../infrastructure/adapters/config/file-config.repository.js';
import { WebSocketBridgeAdapter } from '../../infrastructure/adapters/bridge/websocket-bridge.adapter.js';
import { PluginPackagerAdapter } from '../../infrastructure/adapters/plugin/plugin-packager.adapter.js';
import { McpServerAdapter } from '../../infrastructure/adapters/mcp/mcp-server.adapter.js';

import { StartBridgeUseCase } from '../../application/use-cases/start-bridge.use-case.js';
import { ServeMcpUseCase } from '../../application/use-cases/serve-mcp.use-case.js';
import { RenderUiUseCase } from '../../application/use-cases/render-ui.use-case.js';
import { GetSelectionUseCase } from '../../application/use-cases/get-selection.use-case.js';
import { ManageConfigUseCase } from '../../application/use-cases/manage-config.use-case.js';
import { ExportPluginUseCase } from '../../application/use-cases/export-plugin.use-case.js';

import { createBridgeCommand } from './commands/bridge.command.js';
import { createServeCommand } from './commands/serve.command.js';
import { createStatusCommand } from './commands/status.command.js';
import { createRenderCommand } from './commands/render.command.js';
import { createAuthCommand } from './commands/auth.command.js';
import { createPluginCommand } from './commands/plugin.command.js';
import { createConfigCommand } from './commands/config.command.js';
import { renderFullHelp } from './ui/help/full-help.js';
import { Logger } from './ui/logger.js';

export function createProgram(customConfigPath?: string): Command {
  // 1. Instantiate Adapters
  const cryptoService = new AesCryptoService();
  const configRepo = new FileConfigRepository(customConfigPath);
  const bridgeAdapter = new WebSocketBridgeAdapter();
  const pluginPackager = new PluginPackagerAdapter();

  // 2. Instantiate Use Cases
  const startBridgeUseCase = new StartBridgeUseCase(bridgeAdapter);
  const renderUiUseCase = new RenderUiUseCase(bridgeAdapter);
  const getSelectionUseCase = new GetSelectionUseCase(bridgeAdapter);
  const manageConfigUseCase = new ManageConfigUseCase(configRepo, cryptoService);
  const exportPluginUseCase = new ExportPluginUseCase(pluginPackager);

  const mcpServerAdapter = new McpServerAdapter(
    bridgeAdapter,
    renderUiUseCase,
    getSelectionUseCase
  );
  const serveMcpUseCase = new ServeMcpUseCase(mcpServerAdapter);

  const getLang = async () => {
    return manageConfigUseCase.getLanguage();
  };

  // 3. Build Commander CLI
  const program = new Command('figma-mcp');
  program.version('1.0.0');
  program.description('Hexagonal CLI & MCP Server for crafting UI in Figma');

  program.helpInformation = () => {
    return renderFullHelp('en', '1.0.0');
  };

  // Register commands
  program.addCommand(createBridgeCommand(startBridgeUseCase, getLang));
  program.addCommand(createServeCommand(serveMcpUseCase, startBridgeUseCase, getLang));
  program.addCommand(createStatusCommand(startBridgeUseCase, manageConfigUseCase, getLang));
  program.addCommand(createRenderCommand(renderUiUseCase, getLang));
  program.addCommand(createAuthCommand(manageConfigUseCase, getLang));
  program.addCommand(createPluginCommand(exportPluginUseCase, getLang));
  program.addCommand(createConfigCommand(manageConfigUseCase, getLang));

  // Lifecycle uninstall command
  program
    .command('uninstall')
    .aliases(['remove', 'purge'])
    .description('Uninstall figma-mcp configuration and cleanup local files')
    .option('--purge', 'Remove all configuration and stored tokens')
    .action(async (options) => {
      if (options.purge) {
        const count = await manageConfigUseCase.clear();
        Logger.success(`Purged all configurations (${count} entries removed).`);
      } else {
        Logger.info('Run with --purge to clear all saved credentials and configuration.');
      }
    });

  return program;
}
