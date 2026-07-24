import { describe, it, expect } from "vitest";
import { documentProductionSchema } from "./document-production";

describe("documentProductionSchema", () => {
  it("accepts a valid document with default pending_fields", () => {
    const result = documentProductionSchema.safeParse({
      title: "Petição Inicial",
      document_text: "# DOS FATOS\n\nO requerente...",
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.pending_fields).toEqual([]);
  });

  it("rejects a payload missing document_text", () => {
    const result = documentProductionSchema.safeParse({ title: "Só título" });
    expect(result.success).toBe(false);
  });
});
