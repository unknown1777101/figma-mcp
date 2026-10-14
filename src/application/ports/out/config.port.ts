export interface ConfigEntry {
  key: string;
  value: string;
  isSecret: boolean;
  isEncrypted: boolean;
  alias?: string;
  isActive?: boolean;
}

export interface IConfigRepository {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, isSecret?: boolean): Promise<void>;
  unset(key: string): Promise<boolean>;
  getAll(): Promise<ConfigEntry[]>;
  clear(prefix?: string): Promise<number>;
  getLanguage(): Promise<string>;
  setLanguage(lang: string): Promise<void>;
  getConfigPath(): string;
}
