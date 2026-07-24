import { describe, it, expect } from "vitest";
import { LEGAL_AREAS, areaCodeForLabel } from "./legal-areas";

describe("areaCodeForLabel", () => {
  it("resolves every known area to its own unique code", () => {
    const codes = new Set(LEGAL_AREAS.map((a) => a.code));
    expect(codes.size).toBe(LEGAL_AREAS.length);
  });

  it("returns the correct code for a known label", () => {
    expect(areaCodeForLabel("Civil")).toBe("CIV");
    expect(areaCodeForLabel("Digital e LGPD")).toBe("DIG");
  });

  it("falls back to OUT for an unknown label instead of throwing", () => {
    expect(areaCodeForLabel("Área inexistente")).toBe("OUT");
  });
});
