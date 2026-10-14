import { chromium, Browser, BrowserContext, Page } from 'playwright';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import {
  IHeadlessRunner,
  HeadlessLaunchOptions,
  HeadlessBrowserStatus
} from '../../../application/ports/out/headless-runner.port.js';
import { DomainError } from '../../../domain/errors/domain-errors.js';

export class PlaywrightHeadlessAdapter implements IHeadlessRunner {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;
  private currentStatus: HeadlessBrowserStatus = {
    isRunning: false,
    isHeadless: true,
  };

  private getUserDataDir(): string {
    const custom = process.env.FIGMA_USER_DATA_DIR;
    if (custom) return path.resolve(custom);
    return path.join(os.homedir(), '.figma-mcp', 'browser-data');
  }

  async launch(options: HeadlessLaunchOptions): Promise<HeadlessBrowserStatus> {
    if (this.currentStatus.isRunning) {
      return this.currentStatus;
    }

    const userDataDir = this.getUserDataDir();
    if (!fs.existsSync(userDataDir)) {
      fs.mkdirSync(userDataDir, { recursive: true });
    }

    const isHeadless = options.headless ?? true;

    try {
      this.context = await chromium.launchPersistentContext(userDataDir, {
        headless: isHeadless,
        args: [
          '--disable-blink-features=AutomationControlled',
          '--no-sandbox',
          '--disable-setuid-sandbox',
        ],
        viewport: { width: 1440, height: 900 },
      });

      // Inject Figma session cookie if provided
      if (options.sessionCookie) {
        await this.context.addCookies([
          {
            name: 'figma.st',
            value: options.sessionCookie,
            domain: '.figma.com',
            path: '/',
            httpOnly: true,
            secure: true,
          },
        ]);
      }

      this.page = this.context.pages()[0] || (await this.context.newPage());

      await this.page.goto(options.fileUrl, {
        waitUntil: 'domcontentloaded',
        timeout: 60000,
      });

      this.currentStatus = {
        isRunning: true,
        fileUrl: options.fileUrl,
        isHeadless,
      };

      return this.currentStatus;
    } catch (err: any) {
      await this.stop();
      throw new DomainError(`Failed to launch headless browser: ${err.message}`);
    }
  }

  async stop(): Promise<void> {
    if (this.context) {
      try {
        await this.context.close();
      } catch {}
      this.context = null;
    }
    if (this.browser) {
      try {
        await this.browser.close();
      } catch {}
      this.browser = null;
    }
    this.page = null;
    this.currentStatus = {
      isRunning: false,
      isHeadless: true,
    };
  }

  getStatus(): HeadlessBrowserStatus {
    return this.currentStatus;
  }
}
