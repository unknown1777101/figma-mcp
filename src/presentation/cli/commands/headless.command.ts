import { Command } from 'commander';
import { ILaunchHeadlessUseCase } from '../../../application/ports/in/launch-headless.port.js';
import { IManageConfigUseCase } from '../../../application/ports/in/manage-config.port.js';
import { Logger } from '../ui/logger.js';
import { getHeadlessHelp, formatDomainDoc } from '../ui/help/help-formatter.js';

export function createHeadlessCommand(
  headlessUseCase: ILaunchHeadlessUseCase,
  configUseCase: IManageConfigUseCase,
  getLang: () => Promise<string>
): Command {
  const headless = new Command('headless');
  headless.description('Automate background Figma session via headless browser');

  headless.helpInformation = () => {
    return formatDomainDoc(getHeadlessHelp('en'));
  };

  // launch
  headless
    .command('launch <fileUrl>')
    .aliases(['start', 'run'])
    .description('Open a Figma file in background browser')
    .option('--no-headless', 'Launch in visible window for first-time login')
    .action(async (fileUrl: string, options: any) => {
      try {
        const isHeadless = options.headless !== false;
        Logger.info(`Launching ${isHeadless ? 'headless' : 'interactive'} browser for Figma file...`);

        const cookie = await configUseCase.get('FIGMA_COOKIE');

        const status = await headlessUseCase.execute({
          fileUrl,
          headless: isHeadless,
          sessionCookie: cookie || undefined,
        });

        Logger.success('Figma file opened successfully in browser!');
        Logger.plain('Browser is ready and maintaining session.');
        Logger.plain('Press Ctrl+C to exit.');

        await new Promise(() => {});
      } catch (err: any) {
        Logger.error(`Headless launch failed: ${err.message}`);
        process.exitCode = 1;
      }
    });

  // status
  headless
    .command('status')
    .description('Check active headless browser status')
    .action(() => {
      const status = headlessUseCase.getStatus();
      Logger.printCard('HEADLESS BROWSER STATUS', [
        ['Running', status.isRunning ? 'YES' : 'NO'],
        ['File URL', status.fileUrl || '(none)'],
        ['Headless Mode', status.isHeadless ? 'TRUE' : 'FALSE'],
      ]);
    });

  // stop
  headless
    .command('stop')
    .description('Stop running headless browser')
    .action(async () => {
      await headlessUseCase.stop();
      Logger.success('Headless browser session stopped.');
    });

  headless.action(() => {
    Logger.plain(formatDomainDoc(getHeadlessHelp('en')));
  });

  return headless;
}
