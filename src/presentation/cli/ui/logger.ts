export class Logger {
  private static readonly RESET = '\x1b[0m';
  private static readonly BOLD = '\x1b[1m';
  private static readonly GREEN = '\x1b[32m';
  private static readonly BLUE = '\x1b[34m';
  private static readonly YELLOW = '\x1b[33m';
  private static readonly RED = '\x1b[31m';
  private static readonly CYAN = '\x1b[36m';
  private static readonly GRAY = '\x1b[90m';

  public static info(message: string): void {
    console.log(`${this.CYAN}ℹ${this.RESET} ${message}`);
  }

  public static success(message: string): void {
    console.log(`${this.GREEN}✔${this.RESET} ${message}`);
  }

  public static warn(message: string): void {
    console.log(`${this.YELLOW}⚠${this.RESET} ${message}`);
  }

  public static error(message: string): void {
    console.error(`${this.RED}✖${this.RESET} ${message}`);
  }

  public static plain(message: string): void {
    console.log(message);
  }

  public static maskSecret(value: string): string {
    if (!value) return '(empty)';
    if (value.startsWith('enc:v1:')) {
      return `[encrypted] (AES-256-GCM, ${value.length} chars)`;
    }
    if (value.length <= 8) {
      return '****';
    }
    const start = value.slice(0, 4);
    const end = value.slice(-4);
    return `${start}...${end} (${value.length} chars)`;
  }

  public static printCard(title: string, lines: Array<[string, string]>): void {
    console.log(`\n${this.BOLD}┌─ ${title} ${'─'.repeat(Math.max(2, 50 - title.length))}┐${this.RESET}`);
    for (const [key, val] of lines) {
      const paddedKey = key.padEnd(20);
      console.log(`│ ${this.CYAN}${paddedKey}${this.RESET} : ${val}`);
    }
    console.log(`${this.BOLD}└${'─'.repeat(54)}┘${this.RESET}\n`);
  }

  public static printMissingAuthGuidance(keyName: string, commandExample: string): void {
    console.error(`\n${this.BOLD}${this.RED}┌─ AUTHENTICATION REQUIRED ────────────────────────────┐${this.RESET}`);
    console.error(`│ Missing required credential: ${this.BOLD}${this.RED}${keyName}${this.RESET}`);
    console.error(`│ Required for: Connecting with Figma REST API and exports`);
    console.error(`│ Action: Configure token using interactive command:`);
    console.error(`│   ${this.BOLD}$ ${commandExample}${this.RESET}`);
    console.error(`│ Generate token at: https://www.figma.com/developers/api#access-tokens`);
    console.error(`│ Audit status: $ figma-mcp auth status`);
    console.error(`${this.BOLD}${this.RED}└──────────────────────────────────────────────────────┘${this.RESET}\n`);
  }
}
