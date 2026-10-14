import { DomainHelpDoc, SupportedLanguage } from './types.js';

export function getPluginHelp(lang: SupportedLanguage = 'en'): DomainHelpDoc {
  if (lang === 'id') {
    return {
      domain: 'PLUGIN',
      summary: 'Export dan kelola bundle plugin Figma Desktop',
      commands: [
        {
          command: 'figma-mcp plugin export [outputDir]',
          aliases: ['pack', 'bundle'],
          description: 'Export plugin Figma siap pasang (manifest.json, code.js, ui.html)',
          parameters: [
            { flag: '[outputDir]', description: 'Direktori tujuan export (default: ./figma-plugin-dist)' },
            { flag: '-p, --port <port>', description: 'Port WebSocket bridge yang ditargetkan di ui.html' },
          ],
          examples: [
            'figma-mcp plugin export',
            'figma-mcp plugin export ~/figma-plugin --port 9099',
          ],
        },
        {
          command: 'figma-mcp plugin info',
          aliases: ['manifest'],
          description: 'Tampilkan informasi manifest dan lokasi file plugin',
          examples: ['figma-mcp plugin info'],
        },
      ],
    };
  }

  return {
    domain: 'PLUGIN',
    summary: 'Export and manage the Figma Desktop plugin bundle',
    commands: [
      {
        command: 'figma-mcp plugin export [outputDir]',
        aliases: ['pack', 'bundle'],
        description: 'Export ready-to-import Figma plugin files (manifest.json, code.js, ui.html)',
        parameters: [
          { flag: '[outputDir]', description: 'Destination directory to export plugin files (default: ./figma-plugin-dist)' },
          { flag: '-p, --port <port>', description: 'Target WebSocket bridge port inside ui.html' },
        ],
        examples: [
          'figma-mcp plugin export',
          'figma-mcp plugin export ~/figma-plugin --port 9099',
        ],
      },
      {
        command: 'figma-mcp plugin info',
        aliases: ['manifest'],
        description: 'Display plugin manifest metadata and internal file paths',
        examples: ['figma-mcp plugin info'],
      },
    ],
  };
}
