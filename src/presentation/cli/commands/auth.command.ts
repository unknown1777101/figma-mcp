import { Command } from 'commander';
import { IManageConfigUseCase } from '../../../application/ports/in/manage-config.port.js';
import { Logger } from '../ui/logger.js';
import { TerminalPrompt } from '../ui/prompt.js';
import { getAuthHelp, formatDomainDoc } from '../ui/help/help-formatter.js';

export function createAuthCommand(
  configUseCase: IManageConfigUseCase,
  getLang: () => Promise<string>
): Command {
  const auth = new Command('auth');
  auth.description('Manage Figma Personal Access Tokens (PAT) with AES-256-GCM encryption');

  auth.helpInformation = () => {
    return formatDomainDoc(getAuthHelp('en'));
  };

  // set-token
  const setToken = auth
    .command('set-token [token] [alias]')
    .aliases(['token', 'set-pat', 'pat'])
    .description('Save encrypted Figma token with optional named alias')
    .action(async (tokenArg?: string, aliasArg?: string) => {
      let token = tokenArg;
      if (!token) {
        Logger.info('Launching interactive token wizard...');
        token = await TerminalPrompt.promptSecret('Enter Figma Personal Access Token');
      }

      if (!token) {
        Logger.error('No token provided. Aborted.');
        process.exitCode = 1;
        return;
      }

      const key = aliasArg ? `FIGMA_PAT_${aliasArg.toUpperCase().replace(/[^A-Z0-9_]/g, '_')}` : 'FIGMA_PAT';
      await configUseCase.set(key, token, true);

      // If an alias was supplied, also ensure base FIGMA_PAT is set
      if (aliasArg) {
        const base = await configUseCase.get('FIGMA_PAT');
        if (!base) {
          await configUseCase.set('FIGMA_PAT', token, true);
        }
      }

      Logger.success(`Token saved and encrypted with AES-256-GCM (${key})`);
    });

  // unset-token
  const unsetToken = auth
    .command('unset-token [alias]')
    .aliases(['remove-token', 'rm-token'])
    .description('Remove a stored Figma token')
    .action(async (aliasArg?: string) => {
      const key = aliasArg ? `FIGMA_PAT_${aliasArg.toUpperCase().replace(/[^A-Z0-9_]/g, '_')}` : 'FIGMA_PAT';
      const removed = await configUseCase.unset(key);
      if (removed) {
        Logger.success(`Removed token entry: ${key}`);
      } else {
        Logger.warn(`Token entry ${key} was not found.`);
      }
    });

  // status
  const statusCmd = auth
    .command('status')
    .aliases(['info', 'whoami', 'list'])
    .description('Inspect active token and stored aliases')
    .action(async () => {
      const all = await configUseCase.list();
      const tokenEntries = all.filter((e) => e.key.startsWith('FIGMA_PAT'));

      if (tokenEntries.length === 0) {
        Logger.warn('No Figma tokens configured.');
        Logger.printMissingAuthGuidance('FIGMA_PAT', 'figma-mcp auth set-token');
        return;
      }

      const rows: Array<[string, string]> = tokenEntries.map((e) => [
        e.key,
        Logger.maskSecret(e.value),
      ]);

      Logger.printCard('STORED FIGMA TOKENS', rows);
    });

  // clear-tokens
  auth
    .command('clear-tokens')
    .aliases(['clear'])
    .description('Clear all stored Figma tokens')
    .action(async () => {
      const count = await configUseCase.clear('FIGMA_PAT');
      Logger.success(`Cleared ${count} Figma token entries.`);
    });

  // Default action if bare 'figma-mcp auth' is called
  auth.action(() => {
    Logger.plain(formatDomainDoc(getAuthHelp('en')));
  });

  return auth;
}
