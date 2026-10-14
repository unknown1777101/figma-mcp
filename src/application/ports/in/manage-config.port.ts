import { ConfigEntry } from '../out/config.port.js';

export interface IManageConfigUseCase {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, isSecret?: boolean): Promise<void>;
  unset(key: string): Promise<boolean>;
  list(): Promise<ConfigEntry[]>;
  clear(prefix?: string): Promise<number>;
  getLanguage(): Promise<string>;
  setLanguage(lang: string): Promise<void>;
  getConfigPath(): string;
}
