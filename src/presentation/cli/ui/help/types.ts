export type SupportedLanguage = 'en' | 'id';

export interface CommandDoc {
  command: string;
  aliases?: string[];
  description: string;
  parameters?: Array<{ flag: string; description: string; required?: boolean }>;
  examples?: string[];
}

export interface DomainHelpDoc {
  domain: string;
  summary: string;
  commands: CommandDoc[];
}
