import { SupportedLanguage, DomainHelpDoc } from './types.js';
import { getBridgeHelp } from './bridge-help.js';
import { getMcpHelp } from './mcp-help.js';
import { getRenderHelp } from './render-help.js';
import { getAuthHelp } from './auth-help.js';
import { getPluginHelp } from './plugin-help.js';
import { getConfigHelp } from './config-help.js';

export function getAllDomainDocs(lang: SupportedLanguage = 'en'): DomainHelpDoc[] {
  return [
    getBridgeHelp(lang),
    getMcpHelp(lang),
    getRenderHelp(lang),
    getAuthHelp(lang),
    getPluginHelp(lang),
    getConfigHelp(lang),
  ];
}

export function formatDomainDoc(doc: DomainHelpDoc): string {
  const lines: string[] = [];
  lines.push(`\n=== [ ${doc.domain} ] - ${doc.summary} ===`);

  for (const cmd of doc.commands) {
    const aliasStr = cmd.aliases && cmd.aliases.length > 0 ? ` (aliases: ${cmd.aliases.join(', ')})` : '';
    lines.push(`\n  $ ${cmd.command}${aliasStr}`);
    lines.push(`    ${cmd.description}`);

    if (cmd.parameters && cmd.parameters.length > 0) {
      lines.push('    Parameters:');
      for (const p of cmd.parameters) {
        lines.push(`      ${p.flag.padEnd(28)} ${p.description}`);
      }
    }

    if (cmd.examples && cmd.examples.length > 0) {
      lines.push('    Examples:');
      for (const ex of cmd.examples) {
        lines.push(`      $ ${ex}`);
      }
    }
  }

  return lines.join('\n');
}

export function renderFullHelp(lang: SupportedLanguage = 'en', version: string = '1.0.0'): string {
  const isId = lang === 'id';
  const docs = getAllDomainDocs(lang);

  const lines: string[] = [];
  lines.push(`figma-mcp v${version}`);
  lines.push(isId
    ? 'CLI & Model Context Protocol (MCP) Server untuk Manipulasi UI Canvas Figma secara Realtime'
    : 'Hexagonal CLI & Model Context Protocol (MCP) Server for Figma Canvas UI Manipulation');
  lines.push('');
  lines.push(isId ? 'PENGGUNAAN:' : 'USAGE:');
  lines.push('  $ figma-mcp <command> [options]');
  lines.push('  $ figma-mcp [bridge|serve|render|auth|plugin|config|status]');
  lines.push('');
  lines.push(isId ? 'DAFTAR PERINTAH & PARAMETER LENGKAP:' : 'ALL COMMANDS & PARAMETERS:');

  for (const doc of docs) {
    lines.push(formatDomainDoc(doc));
  }

  lines.push('');
  lines.push(isId ? 'INFORMASI LENGKAP & BANTUAN:' : 'ADDITIONAL HELP:');
  lines.push('  $ figma-mcp <command> --help    # ' + (isId ? 'Bantuan per domain perintah' : 'Inspect domain manual'));
  lines.push('  $ figma-mcp status              # ' + (isId ? 'Cek koneksi bridge & status figma' : 'Audit bridge & canvas connection status'));

  return lines.join('\n');
}
