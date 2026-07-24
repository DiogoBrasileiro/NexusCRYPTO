import { z } from "zod";

// Structured result for single-shot document production (Inteligência, §60-62)
// — distinct from stage-analysis.ts, which is for pipeline stage reports.
export const documentProductionSchema = z.object({
  title: z.string(),
  document_text: z.string(),
  pending_fields: z.array(z.string()).default([]),
});

export type DocumentProduction = z.infer<typeof documentProductionSchema>;

export const DOC_PRODUCTION_TOOL_NAME = "submit_document";

export const DOC_PRODUCTION_INPUT_SCHEMA = {
  type: "object",
  properties: {
    title: { type: "string", description: "Título do documento (ex: 'Petição Inicial — Cobrança de Taxas Condominiais')." },
    document_text: {
      type: "string",
      description:
        "Texto completo do documento, pronto para o editor jurídico. Use # e ## para títulos de seção, ** para negrito, - para listas. Quando um dado necessário não estiver disponível no contexto fornecido, escreva exatamente '[DADO PENDENTE: <o que falta>]' no lugar do dado — nunca invente nomes, números, datas ou valores.",
    },
    pending_fields: {
      type: "array",
      items: { type: "string" },
      description: "Lista curta dos dados pendentes marcados no texto, para destaque na revisão.",
    },
  },
  required: ["title", "document_text"],
} as const;
