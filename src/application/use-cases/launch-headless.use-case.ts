import { ILaunchHeadlessUseCase } from '../ports/in/launch-headless.port.js';
import { IHeadlessRunner, HeadlessBrowserStatus, HeadlessLaunchOptions } from '../ports/out/headless-runner.port.js';
import { ValidationError } from '../../domain/errors/domain-errors.js';

export class LaunchHeadlessUseCase implements ILaunchHeadlessUseCase {
  constructor(private readonly runner: IHeadlessRunner) {}

  async execute(options: HeadlessLaunchOptions): Promise<HeadlessBrowserStatus> {
    if (!options.fileUrl || !options.fileUrl.startsWith('http')) {
      throw new ValidationError('A valid Figma file URL (https://www.figma.com/design/...) is required.');
    }

    return this.runner.launch(options);
  }

  async stop(): Promise<void> {
    await this.runner.stop();
  }

  getStatus(): HeadlessBrowserStatus {
    return this.runner.getStatus();
  }
}
