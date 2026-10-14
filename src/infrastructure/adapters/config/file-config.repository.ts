import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { IConfigRepository, ConfigEntry } from '../../../application/ports/out/config.port.js';

export class FileConfigRepository implements IConfigRepository {
  private configFilePath: string;

  constructor(customPath?: string) {
    if (customPath) {
      this.configFilePath = path.resolve(customPath);
    } else if (process.env.FIGMA_MCP_CONFIG) {
      this.configFilePath = path.resolve(process.env.FIGMA_MCP_CONFIG);
    } else {
      const homeDir = os.homedir();
      this.configFilePath = path.join(homeDir, '.figma-mcp', 'config.json');
    }
  }

  getConfigPath(): string {
    return this.configFilePath;
  }

  private ensureConfigFile(): Record<string, string> {
    try {
      const dir = path.dirname(this.configFilePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      if (!fs.existsSync(this.configFilePath)) {
        fs.writeFileSync(this.configFilePath, JSON.stringify({ lang: 'en' }, null, 2), 'utf8');
        return { lang: 'en' };
      }
      const raw = fs.readFileSync(this.configFilePath, 'utf8');
      return JSON.parse(raw);
    } catch {
      return { lang: 'en' };
    }
  }

  private saveConfigFile(data: Record<string, string>): void {
    const dir = path.dirname(this.configFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(this.configFilePath, JSON.stringify(data, null, 2), 'utf8');
  }

  async get(key: string): Promise<string | null> {
    // 1. Check environment variables first (allows CI/CD overrides)
    const envVal = process.env[key];
    if (envVal !== undefined && envVal.length > 0) {
      return envVal;
    }

    const data = this.ensureConfigFile();
    return data[key] ?? null;
  }

  async set(key: string, value: string, isSecret: boolean = false): Promise<void> {
    const data = this.ensureConfigFile();
    data[key] = value;
    this.saveConfigFile(data);
  }

  async unset(key: string): Promise<boolean> {
    const data = this.ensureConfigFile();
    if (key in data) {
      delete data[key];
      this.saveConfigFile(data);
      return true;
    }
    return false;
  }

  async getAll(): Promise<ConfigEntry[]> {
    const data = this.ensureConfigFile();
    const entries: ConfigEntry[] = [];

    for (const [key, value] of Object.entries(data)) {
      const isSecret = this.isSecretKey(key);
      const isEncrypted = typeof value === 'string' && value.startsWith('enc:v1:');
      entries.push({
        key,
        value,
        isSecret,
        isEncrypted,
      });
    }

    return entries;
  }

  async clear(prefix?: string): Promise<number> {
    const data = this.ensureConfigFile();
    let removedCount = 0;

    if (!prefix) {
      const lang = data['lang'] || 'en';
      removedCount = Object.keys(data).length;
      this.saveConfigFile({ lang });
      return removedCount;
    }

    const nextData: Record<string, string> = {};
    for (const [k, v] of Object.entries(data)) {
      if (k.startsWith(prefix)) {
        removedCount++;
      } else {
        nextData[k] = v;
      }
    }

    this.saveConfigFile(nextData);
    return removedCount;
  }

  async getLanguage(): Promise<string> {
    if (process.env.FIGMA_MCP_LANG) {
      return process.env.FIGMA_MCP_LANG;
    }
    const val = await this.get('lang');
    return val || 'en';
  }

  async setLanguage(lang: string): Promise<void> {
    const sanitized = lang.toLowerCase() === 'id' ? 'id' : 'en';
    await this.set('lang', sanitized);
  }

  private isSecretKey(key: string): boolean {
    const upper = key.toUpperCase();
    return (
      upper.includes('TOKEN') ||
      upper.includes('KEY') ||
      upper.includes('SECRET') ||
      upper.includes('PASSWORD') ||
      upper.includes('PAT') ||
      upper.includes('COOKIE')
    );
  }
}
