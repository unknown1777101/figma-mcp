import { DomainHelpDoc, SupportedLanguage } from './types.js';

export function getAuthHelp(lang: SupportedLanguage = 'en'): DomainHelpDoc {
  if (lang === 'id') {
    return {
      domain: 'AUTH',
      summary: 'Kelola token Personal Access Token (PAT) Figma dengan enkripsi AES-256-GCM',
      commands: [
        {
          command: 'figma-mcp auth set-token [token] [alias]',
          aliases: ['token', 'set-pat', 'pat'],
          description: 'Simpan token Figma terenkripsi dengan alias opsional',
          parameters: [
            { flag: '[token]', description: 'Figma Personal Access Token (kosongkan untuk prompt masked bintang *)' },
            { flag: '[alias]', description: 'Nama alias (contoh: WORK, PERSONAL)' },
          ],
          examples: [
            'figma-mcp auth set-token',
            'figma-mcp auth set-token figd_xyz WORK',
          ],
        },
        {
          command: 'figma-mcp auth unset-token [alias]',
          aliases: ['remove-token', 'rm-token'],
          description: 'Hapus token tersimpan',
          parameters: [
            { flag: '[alias]', description: 'Alias yang ingin dihapus (default: active base token)' },
          ],
          examples: ['figma-mcp auth unset-token', 'figma-mcp auth unset-token WORK'],
        },
        {
          command: 'figma-mcp auth status',
          aliases: ['info', 'whoami'],
          description: 'Tampilkan status token aktif dan daftar alias tersimpan',
          examples: ['figma-mcp auth status'],
        },
      ],
    };
  }

  return {
    domain: 'AUTH',
    summary: 'Manage Figma Personal Access Tokens (PAT) with AES-256-GCM encryption at rest',
    commands: [
      {
        command: 'figma-mcp auth set-token [token] [alias]',
        aliases: ['token', 'set-pat', 'pat'],
        description: 'Save encrypted Figma token with optional named alias',
        parameters: [
          { flag: '[token]', description: 'Figma Personal Access Token (omit to trigger interactive star-masked * wizard)' },
          { flag: '[alias]', description: 'Named alias for multi-account management (e.g., WORK, PERSONAL)' },
        ],
        examples: [
          'figma-mcp auth set-token',
          'figma-mcp auth set-token figd_xyz WORK',
        ],
      },
      {
        command: 'figma-mcp auth unset-token [alias]',
        aliases: ['remove-token', 'rm-token'],
        description: 'Remove a stored token',
        parameters: [
          { flag: '[alias]', description: 'Alias to delete (default: active base token)' },
        ],
        examples: ['figma-mcp auth unset-token', 'figma-mcp auth unset-token WORK'],
      },
      {
        command: 'figma-mcp auth status',
        aliases: ['info', 'whoami'],
        description: 'Inspect active token status and all registered credential aliases',
        examples: ['figma-mcp auth status'],
      },
    ],
  };
}
