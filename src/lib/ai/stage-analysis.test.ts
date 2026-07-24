import { describe, it, expect } from "vitest";
import { stageAnalysisSchema } from "./stage-analysis";

describe("stageAnalysisSchema", () => {
  it("accepts a minimal valid payload and defaults optional arrays", () => {
    const result = stageAnalysisSchema.safeParse({
      stage_summary: "Resumo da etapa.",
      findings: [],
      recommendations: [],
      next_stage_guidance: "",
      confidence: "media",
      verification_status: "nao_verificado",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.risks).toEqual([]);
      expect(result.data.jurisprudence).toEqual([]);
    }
  });

  it("rejects an invalid confidence value instead of silently accepting it", () => {
    const result = stageAnalysisSchema.safeParse({
      stage_summary: "x",
      confidence: "muito_alta",
      verification_status: "verificado",
      next_stage_guidance: "",
    });
    expect(result.success).toBe(false);
  });

  it("requires stage_summary", () => {
    const result = stageAnalysisSchema.safeParse({
      confidence: "alta",
      verification_status: "verificado",
    });
    expect(result.success).toBe(false);
  });
});
