/**
 * Domain models and UI Schema (DSL) for rendering in Figma.
 * Zero external dependencies.
 */

export type ElementType =
  | 'FRAME'
  | 'TEXT'
  | 'RECTANGLE'
  | 'ELLIPSE'
  | 'LINE'
  | 'COMPONENT'
  | 'BUTTON';

export interface RgbaColor {
  r: number; // 0 to 1
  g: number; // 0 to 1
  b: number; // 0 to 1
  a?: number; // 0 to 1, default 1
}

export type ColorInput = string | RgbaColor;

export type LayoutMode = 'NONE' | 'HORIZONTAL' | 'VERTICAL';
export type Alignment = 'MIN' | 'CENTER' | 'MAX' | 'SPACE_BETWEEN';
export type SizingMode = 'FIXED' | 'AUTO';

export interface LayoutPadding {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
}

export interface AutoLayoutProps {
  layoutMode?: LayoutMode;
  padding?: number | LayoutPadding;
  itemSpacing?: number;
  primaryAxisAlignItems?: Alignment;
  counterAxisAlignItems?: 'MIN' | 'CENTER' | 'MAX';
  primaryAxisSizingMode?: SizingMode;
  counterAxisSizingMode?: SizingMode;
  layoutWrap?: 'NO_WRAP' | 'WRAP';
}

export interface TypographyProps {
  fontFamily?: string;
  fontWeight?: 'Regular' | 'Medium' | 'SemiBold' | 'Bold' | 'ExtraBold' | 'Black' | string;
  fontSize?: number;
  lineHeight?: number | 'AUTO';
  letterSpacing?: number;
  textAlignHorizontal?: 'LEFT' | 'CENTER' | 'RIGHT' | 'JUSTIFIED';
  textDecoration?: 'NONE' | 'UNDERLINE' | 'STRIKETHROUGH';
}

export interface SolidPaintProps {
  type?: 'SOLID';
  color: ColorInput;
  opacity?: number;
}

export interface EffectProps {
  type: 'DROP_SHADOW' | 'INNER_SHADOW' | 'LAYER_BLUR';
  color?: ColorInput;
  offset?: { x: number; y: number };
  radius: number;
  spread?: number;
}

export interface StyleProps {
  fills?: SolidPaintProps[];
  strokes?: SolidPaintProps[];
  strokeWeight?: number;
  cornerRadius?: number | [number, number, number, number];
  opacity?: number;
  effects?: EffectProps[];
  clipsContent?: boolean;
}

export interface TextProps {
  content: string;
  typography?: TypographyProps;
  color?: ColorInput;
}

export interface LayoutNode {
  id?: string;
  name?: string;
  type: ElementType;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  layout?: AutoLayoutProps;
  style?: StyleProps;
  text?: TextProps;
  children?: LayoutNode[];
}

export interface RenderResult {
  nodeId: string;
  name: string;
  type: string;
  width: number;
  height: number;
  childrenCount: number;
}

export interface SelectionNodeInfo {
  id: string;
  name: string;
  type: string;
  width: number;
  height: number;
  x: number;
  y: number;
  childrenCount?: number;
}
