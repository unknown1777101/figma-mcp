import { ValidationError } from '../errors/domain-errors.js';
import { LayoutNode, ElementType, RgbaColor } from '../models/element.js';

const VALID_TYPES: Set<ElementType> = new Set([
  'FRAME',
  'TEXT',
  'RECTANGLE',
  'ELLIPSE',
  'LINE',
  'COMPONENT',
  'BUTTON'
]);

export class LayoutValidator {
  public static validate(node: unknown, path: string = 'root'): LayoutNode {
    if (!node || typeof node !== 'object') {
      throw new ValidationError(`Node at '${path}' must be an object`);
    }

    const n = node as Record<string, unknown>;

    if (!n.type || typeof n.type !== 'string') {
      throw new ValidationError(`Node at '${path}' missing required field: 'type'`);
    }

    const upperType = n.type.toUpperCase() as ElementType;
    if (!VALID_TYPES.has(upperType)) {
      throw new ValidationError(
        `Invalid element type '${n.type}' at '${path}'. Valid types: ${Array.from(VALID_TYPES).join(', ')}`
      );
    }

    const validated: LayoutNode = {
      type: upperType,
      name: typeof n.name === 'string' ? n.name : `${upperType}`,
    };

    if (typeof n.id === 'string') validated.id = n.id;
    if (typeof n.width === 'number') validated.width = n.width;
    if (typeof n.height === 'number') validated.height = n.height;
    if (typeof n.x === 'number') validated.x = n.x;
    if (typeof n.y === 'number') validated.y = n.y;

    if (upperType === 'TEXT') {
      if (!n.text && typeof n.content !== 'string') {
        throw new ValidationError(`Text node at '${path}' must have 'text' or 'content' field`);
      }
      if (typeof n.content === 'string') {
        validated.text = { content: n.content };
      } else if (n.text && typeof n.text === 'object') {
        const t = n.text as Record<string, unknown>;
        validated.text = {
          content: typeof t.content === 'string' ? t.content : '',
          color: (t.color as any) || undefined,
          typography: (t.typography as any) || undefined
        };
      }
    }

    if (n.layout && typeof n.layout === 'object') {
      validated.layout = n.layout as any;
    }

    if (n.style && typeof n.style === 'object') {
      validated.style = n.style as any;
    }

    if (Array.isArray(n.children)) {
      validated.children = n.children.map((child, index) =>
        this.validate(child, `${path}.children[${index}]`)
      );
    }

    return validated;
  }

  public static parseColor(color: string | RgbaColor): RgbaColor {
    if (typeof color === 'object') {
      return {
        r: Math.max(0, Math.min(1, color.r)),
        g: Math.max(0, Math.min(1, color.g)),
        b: Math.max(0, Math.min(1, color.b)),
        a: color.a !== undefined ? Math.max(0, Math.min(1, color.a)) : 1,
      };
    }

    if (typeof color === 'string') {
      let hex = color.trim().replace(/^#/, '');
      if (hex.length === 3) {
        hex = hex.split('').map((c) => c + c).join('');
      }
      if (hex.length === 6) {
        const r = parseInt(hex.slice(0, 2), 16) / 255;
        const g = parseInt(hex.slice(2, 4), 16) / 255;
        const b = parseInt(hex.slice(4, 6), 16) / 255;
        return { r, g, b, a: 1 };
      }
      if (hex.length === 8) {
        const r = parseInt(hex.slice(0, 2), 16) / 255;
        const g = parseInt(hex.slice(2, 4), 16) / 255;
        const b = parseInt(hex.slice(4, 6), 16) / 255;
        const a = parseInt(hex.slice(6, 8), 16) / 255;
        return { r, g, b, a };
      }
    }

    // Default black
    return { r: 0, g: 0, b: 0, a: 1 };
  }
}
