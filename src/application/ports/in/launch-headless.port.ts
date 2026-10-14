import { HeadlessBrowserStatus, HeadlessLaunchOptions } from '../out/headless-runner.port.js';

export interface ILaunchHeadlessUseCase {
  execute(options: HeadlessLaunchOptions): Promise<HeadlessBrowserStatus>;
  stop(): Promise<void>;
  getStatus(): HeadlessBrowserStatus;
}
