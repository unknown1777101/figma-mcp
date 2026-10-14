import { Command } from 'commander';
import { IServeMcpUseCase } from '../../../application/ports/in/serve-mcp.port.js';
import { IStartBridgeUseCase } from '../../../application/ports/in/start-bridge.port.js';
import { getMcpHelp, formatDomainDoc } from '../ui/help/help-formatter.js';

export function createServeCommand(
  mcpUseCase: IServeMcpUseCase,
  bridgeUseCase: IStartBridgeUseCase,
  getLang: () => Promise<string>
): Command {
  const cmd = new Command('serve');
  cmd.aliases(['mcp', 's']);
  cmd.description('Start Model Context Protocol (MCP) server over stdio');

  cmd.helpInformation = () => {
    return formatDomainDoc(getMcpHelp('en'));
  };

  cmd.action(async () => {
    try {
      // In stdio mode, start the local bridge automatically on default port 9099
      try {
        await bridgeUseCase.execute(9099);
      } catch (e: any) {
        process.stderr.write(`[figma-mcp] Bridge init note: ${e.message}\n`);
      }

      process.stderr.write('[figma-mcp] MCP Server starting over stdio...\n');
      await mcpUseCase.execute();
    } catch (err: any) {
      process.stderr.write(`[figma-mcp] MCP Server fatal error: ${err.message}\n`);
      process.exitCode = 1;
    }
  });

  return cmd;
}
