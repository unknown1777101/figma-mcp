export interface ICryptoService {
  encrypt(plainText: string): Promise<string>;
  decrypt(cipherText: string): Promise<string>;
  isEncrypted(value: string): boolean;
}
