import { IGetSelectionUseCase } from '../ports/in/get-selection.port.js';
import { IFigmaBridge } from '../ports/out/bridge.port.js';
import { SelectionNodeInfo } from '../../domain/models/element.js';
import { BridgeConnectionError } from '../../domain/errors/domain-errors.js';

export class GetSelectionUseCase implements IGetSelectionUseCase {
  constructor(private readonly bridge: IFigmaBridge) {}

  async execute(timeoutMs: number = 10000): Promise<SelectionNodeInfo[]> {
    if (!this.bridge.isConnected()) {
      throw new BridgeConnectionError(
        'Figma Plugin is not connected to the local bridge. Please launch the Figma Desktop plugin and connect.'
      );
    }

    const result = await this.bridge.sendAction<void, SelectionNodeInfo[]>(
      'GET_SELECTION',
      undefined,
      timeoutMs
    );

    return result || [];
  }
}
