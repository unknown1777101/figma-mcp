import { LayoutNode, RenderResult } from '../../../domain/models/element.js';

export interface IRenderUiUseCase {
  execute(node: unknown, timeoutMs?: number): Promise<RenderResult>;
}
