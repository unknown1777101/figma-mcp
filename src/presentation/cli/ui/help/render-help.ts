import { DomainHelpDoc, SupportedLanguage } from './types.js';

export function getRenderHelp(lang: SupportedLanguage = 'en'): DomainHelpDoc {
  if (lang === 'id') {
    return {
      domain: 'RENDER',
      summary: 'Render komponen UI ke canvas Figma secara langsung dari CLI',
      commands: [
        {
          command: 'figma-mcp render <file>',
          aliases: ['r', 'draw'],
          description: 'Render UI tree spesifikasi JSON langsung ke canvas Figma',
          parameters: [
            { flag: '<file>', description: 'Path file JSON spesifikasi UI (atau gunakan - untuk stdin)', required: true },
            { flag: '-t, --timeout <ms>', description: 'Timeout eksekusi dalam milidetik (default: 30000)' },
          ],
          examples: [
            'figma-mcp render ./button.json',
            'cat ./screen.json | figma-mcp render -',
          ],
        },
      ],
    };
  }

  return {
    domain: 'RENDER',
    summary: 'Render UI components to Figma canvas directly from the CLI',
    commands: [
      {
        command: 'figma-mcp render <file>',
        aliases: ['r', 'draw'],
        description: 'Render UI tree JSON specification directly onto Figma canvas',
        parameters: [
          { flag: '<file>', description: 'Path to JSON file containing UI specification (or - for stdin)', required: true },
          { flag: '-t, --timeout <ms>', description: 'Execution timeout in milliseconds (default: 30000)' },
        ],
        examples: [
          'figma-mcp render ./button.json',
          'cat ./screen.json | figma-mcp render -',
        ],
      },
    ],
  };
}
