import { DomainHelpDoc, SupportedLanguage } from './types.js';

export function getMcpHelp(lang: SupportedLanguage = 'en'): DomainHelpDoc {
  if (lang === 'id') {
    return {
      domain: 'SERVE (MCP)',
      summary: 'Jalankan Model Context Protocol (MCP) server melalui stdio',
      commands: [
        {
          command: 'figma-mcp serve',
          aliases: ['mcp', 's'],
          description: 'Mulai server MCP stdio untuk Hermes, Claude Desktop, atau AI agent lain',
          parameters: [],
          examples: [
            'figma-mcp serve',
            'figma-mcp mcp',
          ],
        },
      ],
    };
  }

  return {
    domain: 'SERVE (MCP)',
    summary: 'Run the Model Context Protocol (MCP) server over stdio',
    commands: [
      {
        command: 'figma-mcp serve',
        aliases: ['mcp', 's'],
        description: 'Start the stdio MCP server for Hermes, Claude Desktop, or AI agents',
        parameters: [],
        examples: [
          'figma-mcp serve',
          'figma-mcp mcp',
        ],
      },
    ],
  };
}
