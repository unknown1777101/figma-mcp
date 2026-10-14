import { DomainHelpDoc, SupportedLanguage } from './types.js';

export function getBridgeHelp(lang: SupportedLanguage = 'en'): DomainHelpDoc {
  if (lang === 'id') {
    return {
      domain: 'BRIDGE',
      summary: 'Jalankan server WebSocket lokal untuk menghubungkan plugin Figma desktop',
      commands: [
        {
          command: 'figma-mcp bridge',
          aliases: ['b', 'ws'],
          description: 'Mulai WebSocket bridge server untuk Figma Plugin',
          parameters: [
            { flag: '-p, --port <port>', description: 'Port WebSocket (default: 9099)' },
          ],
          examples: [
            'figma-mcp bridge',
            'figma-mcp bridge --port 9099',
          ],
        },
      ],
    };
  }

  return {
    domain: 'BRIDGE',
    summary: 'Run the local WebSocket bridge connecting Figma desktop plugin',
    commands: [
      {
        command: 'figma-mcp bridge',
        aliases: ['b', 'ws'],
        description: 'Start WebSocket bridge server for Figma Plugin',
        parameters: [
          { flag: '-p, --port <port>', description: 'WebSocket port (default: 9099)' },
        ],
        examples: [
          'figma-mcp bridge',
          'figma-mcp bridge --port 9099',
        ],
      },
    ],
  };
}
