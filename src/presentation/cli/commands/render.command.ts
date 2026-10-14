import { Command } from 'commander';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { IRenderUiUseCase } from '../../../application/ports/in/render-ui.port.js';
import { Logger } from '../ui/logger.js';
import { getRenderHelp, formatDomainDoc } from '../ui/help/help-formatter.js';

export function createRenderCommand(
  renderUseCase: IRenderUiUseCase,
  getLang: () => Promise<string>
): Command {
  const cmd = new Command('render');
  cmd.aliases(['r', 'draw']);
  cmd.description('Render UI tree JSON specification directly onto Figma canvas');
  cmd.argument('<file>', 'Path to JSON file with UI specification or - for stdin');
  cmd.option('-t, --timeout <ms>', 'Execution timeout in ms', '30000');

  cmd.helpInformation = () => {
    return formatDomainDoc(getRenderHelp('en'));
  };

  cmd.action(async (fileArg: string, options) => {
    const timeout = parseInt(options.timeout, 10) || 30000;

    let jsonContent: string = '';

    if (fileArg === '-') {
      // Read from stdin
      const chunks: Buffer[] = [];
      for await (const chunk of process.stdin) {
        chunks.push(chunk);
      }
      jsonContent = Buffer.concat(chunks).toString('utf8');
    } else {
      const filePath = path.resolve(fileArg);
      if (!fs.existsSync(filePath)) {
        Logger.error(`File not found: ${filePath}`);
        process.exitCode = 1;
        return;
      }
      jsonContent = fs.readFileSync(filePath, 'utf8');
    }

    try {
      const parsed = JSON.parse(jsonContent);
      Logger.info(`Sending UI layout specification to Figma canvas...`);

      const result = await renderUseCase.execute(parsed, timeout);

      Logger.success(`Render completed successfully!`);
      Logger.printCard('RENDERED ELEMENT INFO', [
        ['Node ID', result.nodeId],
        ['Name', result.name],
        ['Type', result.type],
        ['Dimensions', `${result.width} x ${result.height} px`],
        ['Children Count', result.childrenCount.toString()],
      ]);
    } catch (err: any) {
      Logger.error(`Render failed: ${err.message}`);
      process.exitCode = 1;
    }
  });

  return cmd;
}
