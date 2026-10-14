import { test, describe } from 'node:test';
import * as assert from 'node:assert';
import { AesCryptoService } from '../../src/infrastructure/adapters/crypto/aes-crypto.service.js';

describe('AesCryptoService Infrastructure Adapter', () => {
  const cryptoService = new AesCryptoService();

  test('encrypts string with AES-256-GCM format prefix', async () => {
    const plain = 'figd_secure_access_token_12345';
    const encrypted = await cryptoService.encrypt(plain);

    assert.ok(encrypted.startsWith('enc:v1:'));
    assert.strictEqual(cryptoService.isEncrypted(encrypted), true);
    assert.notStrictEqual(encrypted, plain);
  });

  test('decrypts encrypted string back to original plain text', async () => {
    const plain = 'super-secret-pat-token';
    const encrypted = await cryptoService.encrypt(plain);
    const decrypted = await cryptoService.decrypt(encrypted);

    assert.strictEqual(decrypted, plain);
  });

  test('provides transparent fallback for plain unencrypted strings (CI/CD compatibility)', async () => {
    const plainEnvVar = 'raw_unencrypted_ci_token';
    assert.strictEqual(cryptoService.isEncrypted(plainEnvVar), false);

    const decrypted = await cryptoService.decrypt(plainEnvVar);
    assert.strictEqual(decrypted, plainEnvVar);
  });
});
