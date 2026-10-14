import * as crypto from 'node:crypto';
import * as os from 'node:os';
import { ICryptoService } from '../../../application/ports/out/crypto.port.js';
import { CryptoError } from '../../../domain/errors/domain-errors.js';

export class AesCryptoService implements ICryptoService {
  private static readonly PREFIX = 'enc:v1:';
  private static readonly ALGORITHM = 'aes-256-gcm';
  private static readonly KEY_LENGTH = 32;
  private static readonly IV_LENGTH = 12;
  private static readonly SALT_LENGTH = 16;
  private static readonly TAG_LENGTH = 16;

  private derivedKeyCache: Map<string, Buffer> = new Map();

  private getFingerprint(): string {
    const masterKey = process.env.MASTER_KEY || process.env.FIGMA_MCP_MASTER_KEY;
    if (masterKey) return masterKey;

    try {
      const userInfo = os.userInfo();
      return `${userInfo.username}@${os.hostname()}:${os.homedir()}`;
    } catch {
      return `default-user@${os.hostname()}:${os.homedir()}`;
    }
  }

  private deriveKey(salt: Buffer): Buffer {
    const fingerprint = this.getFingerprint();
    const cacheKey = `${fingerprint}:${salt.toString('hex')}`;
    const cached = this.derivedKeyCache.get(cacheKey);
    if (cached) return cached;

    const key = crypto.scryptSync(fingerprint, salt, AesCryptoService.KEY_LENGTH);
    this.derivedKeyCache.set(cacheKey, key);
    return key;
  }

  isEncrypted(value: string): boolean {
    return typeof value === 'string' && value.startsWith(AesCryptoService.PREFIX);
  }

  async encrypt(plainText: string): Promise<string> {
    if (!plainText) return plainText;

    try {
      const salt = crypto.randomBytes(AesCryptoService.SALT_LENGTH);
      const iv = crypto.randomBytes(AesCryptoService.IV_LENGTH);
      const key = this.deriveKey(salt);

      const cipher = crypto.createCipheriv(AesCryptoService.ALGORITHM, key, iv);
      const encrypted = Buffer.concat([
        cipher.update(Buffer.from(plainText, 'utf8')),
        cipher.final(),
      ]);
      const tag = cipher.getAuthTag();

      return `${AesCryptoService.PREFIX}${salt.toString('hex')}:${iv.toString('hex')}:${tag.toString('hex')}:${encrypted.toString('hex')}`;
    } catch (err: any) {
      throw new CryptoError(`Encryption failed: ${err.message}`);
    }
  }

  async decrypt(cipherText: string): Promise<string> {
    if (!cipherText || !this.isEncrypted(cipherText)) {
      // Transparent fallback for unencrypted strings (CI/CD environments)
      return cipherText;
    }

    try {
      const parts = cipherText.slice(AesCryptoService.PREFIX.length).split(':');
      if (parts.length !== 4) {
        throw new CryptoError('Malformed encrypted string structure');
      }

      const [saltHex, ivHex, tagHex, dataHex] = parts;
      const salt = Buffer.from(saltHex, 'hex');
      const iv = Buffer.from(ivHex, 'hex');
      const tag = Buffer.from(tagHex, 'hex');
      const encryptedData = Buffer.from(dataHex, 'hex');

      const key = this.deriveKey(salt);
      const decipher = crypto.createDecipheriv(AesCryptoService.ALGORITHM, key, iv);
      decipher.setAuthTag(tag);

      const decrypted = Buffer.concat([
        decipher.update(encryptedData),
        decipher.final(),
      ]);

      return decrypted.toString('utf8');
    } catch (err: any) {
      throw new CryptoError(`Decryption failed: ${err.message}`);
    }
  }
}
