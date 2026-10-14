import { DomainHelpDoc, SupportedLanguage } from './types.js';

export function getConfigHelp(lang: SupportedLanguage = 'en'): DomainHelpDoc {
  if (lang === 'id') {
    return {
      domain: 'CONFIG',
      summary: 'Kelola preferensi dan konfigurasi figma-mcp',
      commands: [
        {
          command: 'figma-mcp config set-lang <en|id>',
          aliases: ['lang'],
          description: 'Ganti bahasa CLI secara dinamis',
          parameters: [
            { flag: '<en|id>', description: 'Pilihan bahasa: en (English) atau id (Indonesia)', required: true },
          ],
          examples: ['figma-mcp config set-lang en', 'figma-mcp config set-lang id'],
        },
        {
          command: 'figma-mcp config get <key>',
          description: 'Ambil nilai konfigurasi',
          parameters: [{ flag: '<key>', description: 'Nama key konfigurasi', required: true }],
          examples: ['figma-mcp config get lang'],
        },
        {
          command: 'figma-mcp config set <key> <value>',
          description: 'Set nilai konfigurasi',
          parameters: [
            { flag: '<key>', description: 'Nama key', required: true },
            { flag: '<value>', description: 'Nilai yang ingin disimpan', required: true },
          ],
          examples: ['figma-mcp config set DEFAULT_PORT 9099'],
        },
        {
          command: 'figma-mcp config list',
          aliases: ['ls'],
          description: 'Tampilkan semua entri konfigurasi tersimpan',
          examples: ['figma-mcp config list'],
        },
      ],
    };
  }

  return {
    domain: 'CONFIG',
    summary: 'Manage user preferences and figma-mcp configuration',
    commands: [
      {
        command: 'figma-mcp config set-lang <en|id>',
        aliases: ['lang'],
        description: 'Switch active CLI language dynamically',
        parameters: [
          { flag: '<en|id>', description: 'Language code: en (English) or id (Indonesian)', required: true },
        ],
        examples: ['figma-mcp config set-lang en', 'figma-mcp config set-lang id'],
      },
      {
        command: 'figma-mcp config get <key>',
        description: 'Retrieve configuration value',
        parameters: [{ flag: '<key>', description: 'Configuration key name', required: true }],
        examples: ['figma-mcp config get lang'],
      },
      {
        command: 'figma-mcp config set <key> <value>',
        description: 'Set configuration value',
        parameters: [
          { flag: '<key>', description: 'Key name', required: true },
          { flag: '<value>', description: 'Value to persist', required: true },
        ],
        examples: ['figma-mcp config set DEFAULT_PORT 9099'],
      },
      {
        command: 'figma-mcp config list',
        aliases: ['ls'],
        description: 'List all persisted configuration entries',
        examples: ['figma-mcp config list'],
      },
    ],
  };
}
