import { test, describe } from 'node:test';
import * as assert from 'node:assert';
import { IFigmaBridge } from '../../src/application/ports/out/bridge.port.js';
import { BridgeStatus, BridgeAction } from '../../src/domain/models/bridge-protocol.js';
import { StartBridgeUseCase } from '../../src/application/use-cases/start-bridge.use-case.js';
import { RenderUiUseCase } from '../../src/application/use-cases/render-ui.use-case.js';
import { GetSelectionUseCase } from '../../src/application/use-cases/get-selection.use-case.js';
import { BridgeConnectionError } from '../../src/domain/errors/domain-errors.js';

// Mock Bridge Adapter
class MockBridge implements IFigmaBridge {
  public connected: boolean = false;
  public actionsReceived: Array<{ action: BridgeAction; payload?: any }> = [];

  async start(port?: number): Promise<void> {
    this.connected = true;
  }

  async stop(): Promise<void> {
    this.connected = false;
  }

  isConnected(): boolean {
    return this.connected;
  }

  getStatus(): BridgeStatus {
    return {
      connectedClients: this.connected ? 1 : 0,
      pluginActive: this.connected,
      port: 9099,
      uptimeSeconds: 10,
      figmaDocumentName: 'Test File',
      activePageName: 'Page 1',
    };
  }

  async sendAction<TReq = unknown, TRes = unknown>(
    action: BridgeAction,
    payload?: TReq
  ): Promise<TRes> {
    this.actionsReceived.push({ action, payload });

    if (action === 'RENDER_LAYOUT') {
      return {
        nodeId: '12:34',
        name: (payload as any).name || 'MockFrame',
        type: (payload as any).type,
        width: 300,
        height: 200,
        childrenCount: ((payload as any).children || []).length,
      } as unknown as TRes;
    }

    if (action === 'GET_SELECTION') {
      return [
        {
          id: '1:1',
          name: 'SelectedElement',
          type: 'FRAME',
          width: 100,
          height: 100,
          x: 0,
          y: 0,
        },
      ] as unknown as TRes;
    }

    return {} as TRes;
  }
}

describe('Application Layer Use Cases', () => {
  test('StartBridgeUseCase starts bridge and queries status', async () => {
    const bridge = new MockBridge();
    const useCase = new StartBridgeUseCase(bridge);

    const result = await useCase.execute(9099);
    assert.strictEqual(result.port, 9099);
    assert.strictEqual(result.status.pluginActive, true);
    assert.strictEqual(result.status.figmaDocumentName, 'Test File');
  });

  test('RenderUiUseCase throws BridgeConnectionError if bridge is not connected', async () => {
    const bridge = new MockBridge();
    bridge.connected = false;
    const useCase = new RenderUiUseCase(bridge);

    await assert.rejects(
      () => useCase.execute({ type: 'FRAME', name: 'Header' }),
      BridgeConnectionError
    );
  });

  test('RenderUiUseCase validates and forwards layout node to connected bridge', async () => {
    const bridge = new MockBridge();
    bridge.connected = true;
    const useCase = new RenderUiUseCase(bridge);

    const res = await useCase.execute({
      type: 'FRAME',
      name: 'HeroSection',
      children: [{ type: 'TEXT', content: 'Hello' }],
    });

    assert.strictEqual(res.nodeId, '12:34');
    assert.strictEqual(res.name, 'HeroSection');
    assert.strictEqual(res.childrenCount, 1);
    assert.strictEqual(bridge.actionsReceived.length, 1);
    assert.strictEqual(bridge.actionsReceived[0].action, 'RENDER_LAYOUT');
  });

  test('GetSelectionUseCase retrieves selected canvas nodes', async () => {
    const bridge = new MockBridge();
    bridge.connected = true;
    const useCase = new GetSelectionUseCase(bridge);

    const selection = await useCase.execute();
    assert.strictEqual(selection.length, 1);
    assert.strictEqual(selection[0].name, 'SelectedElement');
  });
});
