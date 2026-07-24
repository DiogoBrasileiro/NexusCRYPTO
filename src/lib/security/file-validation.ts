import "server-only";

// Extensions with no legitimate use case for a case/office document and a
// real risk profile (executables, scripts, markup that can carry embedded
// script) are rejected outright, regardless of the declared MIME type —
// File.type is fully client-controlled and trivially spoofable.
const BLOCKED_EXTENSIONS = new Set([
  "exe", "sh", "bat", "cmd", "com", "msi", "js", "mjs", "cjs", "vbs", "ps1",
  "html", "htm", "svg", "php", "jar", "app", "scr",
]);

// Magic-byte signatures for the formats we can cheaply verify. When the
// declared MIME type matches one of these families, the actual file bytes
// must match too — a mismatch means the browser-supplied Content-Type was
// either wrong or deliberately spoofed.
const SIGNATURES: { mimePrefixes: string[]; check: (bytes: Uint8Array) => boolean }[] = [
  { mimePrefixes: ["application/pdf"], check: (b) => matches(b, [0x25, 0x50, 0x44, 0x46]) }, // %PDF
  { mimePrefixes: ["image/png"], check: (b) => matches(b, [0x89, 0x50, 0x4e, 0x47]) },
  { mimePrefixes: ["image/jpeg", "image/jpg"], check: (b) => matches(b, [0xff, 0xd8, 0xff]) },
  { mimePrefixes: ["image/gif"], check: (b) => matches(b, [0x47, 0x49, 0x46, 0x38]) },
  {
    mimePrefixes: ["image/webp"],
    check: (b) => matches(b, [0x52, 0x49, 0x46, 0x46]) && matches(b.slice(8), [0x57, 0x45, 0x42, 0x50]),
  },
  {
    // .docx/.xlsx/.pptx are zip containers (PK\x03\x04); legacy .doc/.xls
    // use the OLE2 signature instead.
    mimePrefixes: [
      "application/vnd.openxmlformats",
      "application/zip",
      "application/msword",
      "application/vnd.ms-excel",
    ],
    check: (b) => matches(b, [0x50, 0x4b, 0x03, 0x04]) || matches(b, [0xd0, 0xcf, 0x11, 0xe0]),
  },
];

function matches(bytes: Uint8Array, signature: number[]): boolean {
  if (bytes.length < signature.length) return false;
  return signature.every((byte, index) => bytes[index] === byte);
}

export type FileValidationResult = { ok: true } | { ok: false; error: string };

export async function validateUploadedFile(file: File): Promise<FileValidationResult> {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (BLOCKED_EXTENSIONS.has(extension)) {
    return { ok: false, error: "Este tipo de arquivo não é permitido." };
  }

  const declaredType = (file.type || "").toLowerCase();
  const signature = SIGNATURES.find((s) => s.mimePrefixes.some((prefix) => declaredType.startsWith(prefix)));
  if (signature) {
    const head = new Uint8Array(await file.slice(0, 16).arrayBuffer());
    if (!signature.check(head)) {
      return { ok: false, error: "O conteúdo do arquivo não corresponde ao tipo declarado." };
    }
  }

  return { ok: true };
}
