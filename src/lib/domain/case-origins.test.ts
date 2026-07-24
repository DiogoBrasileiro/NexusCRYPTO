import { describe, it, expect } from "vitest";
import { CASE_ORIGINS, originLabel } from "./case-origins";

describe("case origins", () => {
  it("has exactly the 9 origins from §36", () => {
    expect(CASE_ORIGINS).toHaveLength(9);
  });

  it("every origin has a suggested depth", () => {
    for (const origin of CASE_ORIGINS) {
      expect(["rapida", "profissional", "completa"]).toContain(origin.suggestedDepth);
    }
  });

  it("originLabel resolves known values and falls back to the raw key otherwise", () => {
    expect(originLabel("consulta_inicial")).toBe("Consulta inicial");
    // @ts-expect-error deliberately testing an invalid value's fallback behavior
    expect(originLabel("valor_desconhecido")).toBe("valor_desconhecido");
  });
});
