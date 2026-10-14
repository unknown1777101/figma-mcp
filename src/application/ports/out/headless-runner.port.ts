export interface HeadlessLaunchOptions {
  fileUrl: string;
  headless?: boolean;
  pluginCodePath?: string;
  bridgePort?: number;
  sessionCookie?: string;
}

export interface HeadlessBrowserStatus {
  isRunning: boolean;
  fileUrl?: string;
  isHeadless: boolean;
  pid?: number;
}

export interface IHeadlessRunner {
  launch(options: HeadlessLaunchOptions): Promise<HeadlessBrowserStatus>;
  stop(): Promise<void>;
  getStatus(): HeadlessBrowserStatus;
}
