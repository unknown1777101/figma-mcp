import { test, describe } from 'node:test';
import * as assert from 'node:assert';
import { createProgram } from '../../src/presentation/cli/program.js';
import { renderFullHelp } from '../../src/presentation/cli/ui/help/full-help.js';

describe('Presentation CLI Layer & Help System', () => {
  test('renderFullHelp renders complete directory with stable header', () => {
    const helpEn = renderFullHelp('en', '1.0.0');
    assert.ok(helpEn.includes('ALL COMMANDS & PARAMETERS:'));
    assert.ok(helpEn.includes('=== [ BRIDGE ]'));
    assert.ok(helpEn.includes('=== [ SERVE (MCP) ]'));
    assert.ok(helpEn.includes('=== [ RENDER ]'));
    assert.ok(helpEn.includes('=== [ AUTH ]'));
    assert.ok(helpEn.includes('=== [ PLUGIN ]'));
    assert.ok(helpEn.includes('=== [ CONFIG ]'));
  });

  test('renderFullHelp supports Indonesian localization', () => {
    const helpId = renderFullHelp('id', '1.0.0');
    assert.ok(helpId.includes('DAFTAR PERINTAH & PARAMETER LENGKAP:'));
    assert.ok(helpId.includes('PENGGUNAAN:'));
  });

  test('createProgram exposes all required subcommands', () => {
    const program = createProgram();
    const commandNames = program.commands.map((c) => c.name());

    assert.ok(commandNames.includes('bridge'));
    assert.ok(commandNames.includes('serve'));
    assert.ok(commandNames.includes('status'));
    assert.ok(commandNames.includes('render'));
    assert.ok(commandNames.includes('auth'));
    assert.ok(commandNames.includes('plugin'));
    assert.ok(commandNames.includes('config'));
    assert.ok(commandNames.includes('uninstall'));
  });
});
