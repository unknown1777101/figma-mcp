import { test, describe } from 'node:test';
import * as assert from 'node:assert';
import { LaunchHeadlessUseCase } from '../../src/application/use-cases/launch-headless.use-case.js';
import { IHeadlessRunner, HeadlessBrowserStatus, HeadlessLaunchOptions } from '../../src/application/ports/out/headless-runner.port.js';
import { ValidationError } from '../../src/domain/errors/domain-errors.js';

class MockHeadlessRunner implements IHeadlessRunner {
  private status: HeadlessBrowserStatus = { isRunning: false, isHeadless: true };

  async launch(options: HeadlessLaunchOptions): Promise<HeadlessBrowserStatus> {
    this.status = {
      isRunning: true,
      fileUrl: options.fileUrl,
      isHeadless: options.headless ?? true,
    };
    return this.status;
  }

  async stop(): Promise<void> {
    this.status = { isRunning: false, isHeadless: true };
  }

  getStatus(): HeadlessBrowserStatus {
    return this.status;
  }
}

describe('LaunchHeadlessUseCase', () => {
  test('validates file URL format', async () => {
    const runner = new MockHeadlessRunner();
    const useCase = new LaunchHeadlessUseCase(runner);

    await assert.rejects(
      () => useCase.execute({ fileUrl: 'invalid-url' }),
      ValidationError
    );
  });

  test('successfully launches headless session with valid Figma URL', async () => {
    const runner = new MockHeadlessRunner();
    const useCase = new LaunchHeadlessUseCase(runner);

    const status = await useCase.execute({
      fileUrl: 'https://www.figma.com/design/test12345/Project',
      headless: true,
    });

    assert.strictEqual(status.isRunning, true);
    assert.strictEqual(status.isHeadless, true);
    assert.strictEqual(status.fileUrl, 'https://www.figma.com/design/test12345/Project');
  });
});
