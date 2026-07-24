import { describe, it, expect } from "vitest";
import { validateUploadedFile } from "./file-validation";

function makeFile(name: string, type: string, bytes: number[]) {
  return new File([new Uint8Array(bytes)], name, { type });
}

describe("validateUploadedFile", () => {
  it("rejects blocked extensions regardless of declared MIME type", async () => {
    const file = makeFile("invoice.html", "image/png", [0x89, 0x50, 0x4e, 0x47]);
    const result = await validateUploadedFile(file);
    expect(result.ok).toBe(false);
  });

  it("accepts a real PDF declared as application/pdf", async () => {
    const file = makeFile("peticao.pdf", "application/pdf", [0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34]);
    const result = await validateUploadedFile(file);
    expect(result.ok).toBe(true);
  });

  it("rejects a file whose declared MIME doesn't match its magic bytes", async () => {
    // Declares itself a PDF but the bytes are actually a PNG signature.
    const file = makeFile("fake.pdf", "application/pdf", [0x89, 0x50, 0x4e, 0x47]);
    const result = await validateUploadedFile(file);
    expect(result.ok).toBe(false);
  });

  it("allows types with no known signature (e.g. audio) through unchecked", async () => {
    const file = makeFile("gravacao.mp3", "audio/mpeg", [0xff, 0xfb, 0x90]);
    const result = await validateUploadedFile(file);
    expect(result.ok).toBe(true);
  });
});
