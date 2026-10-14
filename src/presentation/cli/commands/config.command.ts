import { Command } from 'commander';
import { IManageConfigUseCase } from '../../../application/ports/in/manage-config.port.js';
import { Logger } from '../ui/logger.js';
import { getConfigHelp, formatDomainDoc } from '../ui/help/help-formatter.js';

export function createConfigCommand(
  configUseCase: IManageConfigUseCase,
  getLang: () => Promise<string>
): Command {
  const config = new Command('config');
  config.description('Manage user preferences and figma-mcp configuration');

  config.helpInformation = () => {
    return formatDomainDoc(getConfigHelp('en'));
  };

  // set-lang
  config
    .command('set-lang <lang>')
    .aliases(['lang'])
    .description('Switch active CLI language (en | id)')
    .action(async (lang: string) => {
      const sanitized = lang.toLowerCase();
      if (sanitized !== 'en' && sanitized !== 'id') {
        Logger.error('Supported languages are: en, id');
        process.exitCode = 1;
        return;
      }
      await configUseCase.setLanguage(sanitized);
      Logger.success(`Language set to: ${sanitized === 'id' ? 'Bahasa Indonesia (id)' : 'English (en)'}`);
    });

  // get
  config
    .command('get <key>')
    .description('Retrieve configuration value by key')
    .action(async (key: string) => {
      const val = await configUseCase.get(key);
      if (val === null) {
        Logger.warn(`Key '${key}' not found.`);
      } else {
        const isSecret = key.toUpperCase().includes('TOKEN') || key.toUpperCase().includes('SECRET');
        Logger.plain(`${key} = ${isSecret ? Logger.maskSecret(val) : val}`);
      }
    });

  // set
  config
    .command('set <key> <value>')
    .description('Set configuration value')
    .action(async (key: string, value: string) => {
      await configUseCase.set(key, value);
      Logger.success(`Configuration updated: ${key}`);
    });

  // list
  config
    .command('list')
    .aliases(['ls'])
    .description('List all configuration entries')
    .action(async () => {
      const entries = await configUseCase.list();
      if (entries.length === 0) {
        Logger.info('Configuration is empty.');
        return;
      }

      const rows: Array<[string, string]> = entries.map((e) => [
        e.key,
        e.isSecret ? Logger.maskSecret(e.value) : e.value,
      ]);

      Logger.printCard('CONFIG ENTRIES', rows);
    });

  // clear
  config
    .command('clear')
    .description('Clear all stored configurations')
    .action(async () => {
      const count = await configUseCase.clear();
      Logger.success(`Cleared ${count} configuration entries.`);
    });

  config.action(() => {
    Logger.plain(formatDomainDoc(getConfigHelp('en')));
  });

  return config;
}
