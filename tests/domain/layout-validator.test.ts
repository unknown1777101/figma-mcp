import { test, describe } from 'node:test';
import * as assert from 'node:assert';
import { LayoutValidator } from '../../src/domain/dsl/layout-validator.js';
import { ValidationError } from '../../src/domain/errors/domain-errors.js';

describe('LayoutValidator Domain Service', () => {
  test('validates valid FRAME with AutoLayout and children', () => {
    const raw = {
      type: 'FRAME',
      name: 'CardContainer',
      width: 320,
      height: 480,
      layout: {
        layoutMode: 'VERTICAL',
        padding: 16,
        itemSpacing: 12,
        primaryAxisAlignItems: 'CENTER',
      },
      children: [
        {
          type: 'TEXT',
          name: 'Title',
          text: {
            content: 'Hello Figma MCP',
            color: '#1E293B',
          },
        },
        {
          type: 'BUTTON',
          name: 'SubmitBtn',
          content: 'Click Me',
        },
      ],
    };

    const validated = LayoutValidator.validate(raw);
    assert.strictEqual(validated.type, 'FRAME');
    assert.strictEqual(validated.name, 'CardContainer');
    assert.strictEqual(validated.children?.length, 2);
    assert.strictEqual(validated.children[0].type, 'TEXT');
    assert.strictEqual(validated.children[1].type, 'BUTTON');
  });

  test('throws ValidationError when type is missing or invalid', () => {
    assert.throws(
      () => LayoutValidator.validate({ name: 'NoType' }),
      ValidationError
    );

    assert.throws(
      () => LayoutValidator.validate({ type: 'INVALID_TYPE' }),
      ValidationError
    );
  });

  test('parses Hex and RGBA colors accurately', () => {
    // 6-digit hex
    const red = LayoutValidator.parseColor('#FF0000');
    assert.strictEqual(red.r, 1);
    assert.strictEqual(red.g, 0);
    assert.strictEqual(red.b, 0);
    assert.strictEqual(red.a, 1);

    // 3-digit hex (#FFF)
    const white = LayoutValidator.parseColor('#FFF');
    assert.strictEqual(white.r, 1);
    assert.strictEqual(white.g, 1);
    assert.strictEqual(white.b, 1);

    // 8-digit hex with alpha (#00FF0080 -> 128/255 approx 0.5)
    const semiGreen = LayoutValidator.parseColor('#00FF0080');
    assert.strictEqual(semiGreen.r, 0);
    assert.strictEqual(semiGreen.g, 1);
    assert.strictEqual(semiGreen.b, 0);
    assert.ok(Math.abs(semiGreen.a! - 0.5) < 0.01);
  });
});
