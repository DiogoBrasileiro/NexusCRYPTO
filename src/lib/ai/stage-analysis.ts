import { z } from "zod";

// Structured result every specialist must return (§58). The frontend
// renders these fields as a professional report — the model's JSON/tool
// call never reaches the browser verbatim.
export const stageAnalysisSchema = z.object({
  stage_summary: z.string(),
  findings: z.array(z.string()).default([]),
  facts_considered: z.array(z.string()).default([]),
  legal_basis: z.array(z.string()).default([]),
  jurisprudence: z.array(z.string()).default([]),
  risks: z.array(z.string()).default([]),
  contradictions: z.array(z.string()).default([]),
  missing_information: z.array(z.string()).default([]),
  recommendations: z.array(z.string()).default([]),
  next_stage_guidance: z.string().default(""),
  confidence: z.enum(["alta", "media", "baixa"]).default("media"),
  verification_status: z.enum(["verificado", "parcial", "nao_verificado"]).default("nao_verificado"),
});

export type StageAnalysis = z.infer<typeof stageAnalysisSchema>;

export const STAGE_ANALYSIS_TOOL_NAME = "submit_stage_analysis";

export const STAGE_ANALYSIS_INPUT_SCHEMA = {
  type: "object",
  properties: {
    stage_summary: { type: "string", description: "Resumo executivo desta etapa, 2-4 frases, direto e técnico." },
    findings: { type: "array", items: { type: "string" }, description: "Principais achados desta etapa, um por item." },
    facts_considered: { type: "array", items: { type: "string" }, description: "Fatos do caso efetivamente usados nesta análise." },
    legal_basis: { type: "array", items: { type: "string" }, description: "Fundamentos legais identificados (norma, artigo, e se ainda não verificados em fonte oficial)." },
    jurisprudence: { type: "array", items: { type: "string" }, description: "Precedentes relevantes, com tribunal e estado de verificação. Vazio se nenhum for identificável com segurança." },
    risks: { type: "array", items: { type: "string" }, description: "Riscos e pontos fracos identificados." },
    contradictions: { type: "array", items: { type: "string" }, description: "Contradições entre fatos, documentos ou etapas anteriores." },
    missing_information: { type: "array", items: { type: "string" }, description: "Informações ou documentos ausentes que limitam a análise." },
    recommendations: { type: "array", items: { type: "string" }, description: "Recomendações objetivas para o advogado." },
    next_stage_guidance: { type: "string", description: "Orientação a ser repassada à próxima etapa da linha de produção." },
    confidence: { type: "string", enum: ["alta", "media", "baixa"], description: "Confiança geral desta análise." },
    verification_status: {
      type: "string",
      enum: ["verificado", "parcial", "nao_verificado"],
      description: "Se as fontes legais/jurisprudenciais citadas foram verificadas contra fonte oficial.",
    },
  },
  required: ["stage_summary", "findings", "recommendations", "next_stage_guidance", "confidence", "verification_status"],
} as const;
