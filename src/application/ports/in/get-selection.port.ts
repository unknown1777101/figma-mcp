import { SelectionNodeInfo } from '../../../domain/models/element.js';

export interface IGetSelectionUseCase {
  execute(timeoutMs?: number): Promise<SelectionNodeInfo[]>;
}
