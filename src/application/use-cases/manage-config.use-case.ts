import { IManageConfigUseCase } from '../ports/in/manage-config.port.js';
import { IConfigRepository, ConfigEntry } from '../ports/out/config.port.js';
import { ICryptoService } from '../ports/out/crypto.port.js';

export class ManageConfigUseCase implements IManageConfigUseCase {
  constructor(
    private readonly configRepo: IConfigRepository,
    private readonly cryptoService: ICryptoService
  ) {}

  async get(key: string): Promise<string | null> {
    const raw = await this.configRepo.get(key);
    if (!raw) return null;
    if (this.cryptoService.isEncrypted(raw)) {
      return this.cryptoService.decrypt(raw);
    }
    return raw;
  }

  async set(key: string, value: string, isSecret: boolean = false): Promise<void> {
    const sanitizedKey = key.trim();
    let finalValue = value.trim();

    if (isSecret || this.isKnownSecretKey(sanitizedKey)) {
      finalValue = await this.cryptoService.encrypt(finalValue);
      await this.configRepo.set(sanitizedKey, finalValue, true);
    } else {
      await this.configRepo.set(sanitizedKey, finalValue, false);
    }

    // If an alias key was set (e.g. FIGMA_PAT_WORK), sync to base key if none active
    const aliasMatch = sanitizedKey.match(/^([A-Z_]+)_([A-Z0-9]+)$/);
    if (aliasMatch) {
      const baseKey = aliasMatch[1];
      const activeVal = await this.configRepo.get(baseKey);
      if (!activeVal) {
        await this.configRepo.set(baseKey, finalValue, true);
      }
    }
  }

  async unset(key: string): Promise<boolean> {
    return this.configRepo.unset(key.trim());
  }

  async list(): Promise<ConfigEntry[]> {
    return this.configRepo.getAll();
  }

  async clear(prefix?: string): Promise<number> {
    return this.configRepo.clear(prefix);
  }

  async getLanguage(): Promise<string> {
    return this.configRepo.getLanguage();
  }

  async setLanguage(lang: string): Promise<void> {
    return this.configRepo.setLanguage(lang);
  }

  getConfigPath(): string {
    return this.configRepo.getConfigPath();
  }

  private isKnownSecretKey(key: string): boolean {
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
