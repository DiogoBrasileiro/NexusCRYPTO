import "server-only";
import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

// AES-256-GCM at-rest encryption for the global AI provider credential.
// AI_SETTINGS_ENCRYPTION_KEY must be a base64-encoded 32-byte key
// (`openssl rand -base64 32`), set only in the server environment.

function getKey(): Buffer {
  const b64 = process.env.AI_SETTINGS_ENCRYPTION_KEY;
  if (!b64) {
    throw new Error("AI_SETTINGS_ENCRYPTION_KEY não configurada no ambiente do servidor.");
  }
  const key = Buffer.from(b64, "base64");
  if (key.length !== 32) {
    throw new Error("AI_SETTINGS_ENCRYPTION_KEY deve decodificar para 32 bytes.");
  }
  return key;
}

export function encryptSecret(plaintext: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return [iv.toString("base64"), authTag.toString("base64"), encrypted.toString("base64")].join(".");
}

export function decryptSecret(ciphertext: string): string {
  const [ivB64, authTagB64, dataB64] = ciphertext.split(".");
  if (!ivB64 || !authTagB64 || !dataB64) {
    throw new Error("Formato de credencial inválido.");
  }
  const decipher = createDecipheriv("aes-256-gcm", getKey(), Buffer.from(ivB64, "base64"));
  decipher.setAuthTag(Buffer.from(authTagB64, "base64"));
  const decrypted = Buffer.concat([decipher.update(Buffer.from(dataB64, "base64")), decipher.final()]);
  return decrypted.toString("utf8");
}
