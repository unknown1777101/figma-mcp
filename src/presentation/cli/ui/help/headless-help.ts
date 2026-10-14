import { DomainHelpDoc, SupportedLanguage } from './types.js';

export function getHeadlessHelp(lang: SupportedLanguage = 'en'): DomainHelpDoc {
  if (lang === 'id') {
    return {
      domain: 'HEADLESS',
      summary: 'Jalankan sesi browser Figma otomatis di background tanpa Figma Desktop',
      commands: [
        {
          command: 'figma-mcp headless launch <fileUrl>',
          aliases: ['start', 'run'],
          description: 'Buka file Figma via headless browser Chromium secara otomatis',
          parameters: [
            { flag: '<fileUrl>', description: 'URL file Figma (https://www.figma.com/design/...)', required: true },
            { flag: '--no-headless', description: 'Tampilkan GUI window browser untuk login interaktif' },
          ],
          examples: [
            'figma-mcp headless launch https://www.figma.com/design/abc123xyz/Project',
            'figma-mcp headless launch https://www.figma.com/design/abc123xyz/Project --no-headless',
          ],
        },
        {
          command: 'figma-mcp headless status',
          description: 'Cek status browser background aktif',
          examples: ['figma-mcp headless status'],
        },
        {
          command: 'figma-mcp headless stop',
          description: 'Hentikan sesi headless browser yang sedang berjalan',
          examples: ['figma-mcp headless stop'],
        },
      ],
    };
  }

  return {
    domain: 'HEADLESS',
    summary: 'Run automated background Figma browser session without Figma Desktop',
    commands: [
      {
        command: 'figma-mcp headless launch <fileUrl>',
        aliases: ['start', 'run'],
        description: 'Open a Figma file via automated headless Chromium browser',
        parameters: [
          { flag: '<fileUrl>', description: 'Figma file URL (https://www.figma.com/design/...)', required: true },
          { flag: '--no-headless', description: 'Show GUI browser window for interactive first-time login' },
        ],
        examples: [
          'figma-mcp headless launch https://www.figma.com/design/abc123xyz/Project',
          'figma-mcp headless launch https://www.figma.com/design/abc123xyz/Project --no-headless',
        ],
      },
      {
        command: 'figma-mcp headless status',
        description: 'Check active background headless browser status',
        examples: ['figma-mcp headless status'],
      },
      {
        command: 'figma-mcp headless stop',
        description: 'Stop the running headless browser session',
        examples: ['figma-mcp headless stop'],
      },
    ],
  };
}
