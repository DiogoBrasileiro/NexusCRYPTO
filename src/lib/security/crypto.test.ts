import { describe, it, expect, beforeAll } from "vitest";
import { randomBytes } from "node:crypto";

beforeAll(() => {
  process.env.AI_SETTINGS_ENCRYPTION_KEY = randomBytes(32).toString("base64");
});

describe("encryptSecret / decryptSecret", () => {
  it("round-trips a plaintext secret", async () => {
    const { encryptSecret, decryptSecret } = await import("./crypto");
    const plaintext = "sk-ant-super-secret-key-value";
    const ciphertext = encryptSecret(plaintext);
    expect(ciphertext).not.toContain(plaintext);
    expect(decryptSecret(ciphertext)).toBe(plaintext);
  });

  it("produces a different ciphertext each time (random IV)", async () => {
    const { encryptSecret } = await import("./crypto");
    const a = encryptSecret("same-value");
    const b = encryptSecret("same-value");
    expect(a).not.toBe(b);
  });

  it("fails to decrypt a tampered ciphertext instead of returning garbage silently", async () => {
    const { encryptSecret, decryptSecret } = await import("./crypto");
    const ciphertext = encryptSecret("value");
    const [iv, tag, data] = ciphertext.split(".");
    const tampered = [iv, tag, data.slice(0, -2) + "aa"].join(".");
    expect(() => decryptSecret(tampered)).toThrow();
  });
});
