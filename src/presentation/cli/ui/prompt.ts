import * as readline from 'node:readline';

export class TerminalPrompt {
  public static async promptText(question: string, defaultValue: string = ''): Promise<string> {
    const defaultSuffix = defaultValue ? ` [${defaultValue}]: ` : ': ';
    const promptMessage = question + defaultSuffix;

    if (!process.stdin.isTTY) {
      // Non-interactive / piped fallback
      return new Promise((resolve) => {
        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout,
          terminal: false,
        });

        rl.question(promptMessage, (answer) => {
          rl.close();
          const trimmed = answer.trim();
          resolve(trimmed || defaultValue);
        });
      });
    }

    // Interactive TTY mode
    return new Promise((resolve) => {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      rl.question(promptMessage, (answer) => {
        rl.close();
        const trimmed = answer.trim();
        resolve(trimmed || defaultValue);
      });
    });
  }

  public static async promptSecret(question: string): Promise<string> {
    const promptMessage = question + ': ';

    if (!process.stdin.isTTY) {
      // Non-TTY fallback
      return new Promise((resolve) => {
        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout,
          terminal: false,
        });

        rl.question(promptMessage, (answer) => {
          rl.close();
          resolve(answer.trim());
        });
      });
    }

    // Interactive TTY with in-terminal star masking (*)
    return new Promise((resolve) => {
      process.stdout.write(promptMessage);
      const stdin = process.stdin;
      stdin.setRawMode(true);
      stdin.resume();
      stdin.setEncoding('utf8');

      let input = '';

      const onData = (chunk: string) => {
        for (const char of chunk) {
          if (char === '\u0003') {
            // Ctrl+C
            stdin.setRawMode(false);
            stdin.pause();
            stdin.removeListener('data', onData);
            process.stdout.write('\n');
            process.exitCode = 1;
            resolve('');
            return;
          }

          if (char === '\r' || char === '\n') {
            // Enter
            stdin.setRawMode(false);
            stdin.pause();
            stdin.removeListener('data', onData);
            process.stdout.write('\n');
            resolve(input.trim());
            return;
          }

          if (char === '\u0008' || char === '\x7f') {
            // Backspace / Delete
            if (input.length > 0) {
              input = input.slice(0, -1);
              process.stdout.write('\b \b');
            }
          } else if (char.charCodeAt(0) >= 32) {
            // Printable char
            input += char;
            process.stdout.write('*');
          }
        }
      };

      stdin.on('data', onData);
    });
  }
}
