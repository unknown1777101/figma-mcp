import { IRenderUiUseCase } from '../ports/in/render-ui.port.js';
import { IFigmaBridge } from '../ports/out/bridge.port.js';
import { LayoutValidator } from '../../domain/dsl/layout-validator.js';
import { RenderResult } from '../../domain/models/element.js';
import { BridgeConnectionError } from '../../domain/errors/domain-errors.js';

export class RenderUiUseCase implements IRenderUiUseCase {
  constructor(private readonly bridge: IFigmaBridge) {}

  async execute(node: unknown, timeoutMs: number = 30000): Promise<RenderResult> {
    const validatedNode = LayoutValidator.validate(node);

    const result = await this.bridge.sendAction<unknown, RenderResult>(
      'RENDER_LAYOUT',
      validatedNode,
      timeoutMs
    );

    return result;
  }
}
