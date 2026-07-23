import type { CaseDepth, CaseOrigin } from "@/lib/types/database";

export const CASE_ORIGINS: {
  value: CaseOrigin;
  label: string;
  description: string;
  suggestedDepth: CaseDepth;
}[] = [
  {
    value: "consulta_inicial",
    label: "Consulta inicial",
    description: "O cliente explicou o problema. Sem processo ou notificação.",
    suggestedDepth: "profissional",
  },
  {
    value: "notificacao_judicial",
    label: "Notificação judicial",
    description: "Citação, intimação, despacho, sentença ou documento do tribunal.",
    suggestedDepth: "profissional",
  },
  {
    value: "processo_em_andamento",
    label: "Processo em andamento",
    description: "O cliente já possui processo judicial.",
    suggestedDepth: "profissional",
  },
  {
    value: "contrato_para_analise",
    label: "Contrato para análise",
    description: "Análise ou revisão contratual.",
    suggestedDepth: "rapida",
  },
  {
    value: "cobranca_extrajudicial",
    label: "Cobrança extrajudicial",
    description: "Cobrança sem processo judicial.",
    suggestedDepth: "rapida",
  },
  {
    value: "parecer_juridico",
    label: "Parecer jurídico",
    description: "Elaboração de parecer.",
    suggestedDepth: "rapida",
  },
  {
    value: "defesa_administrativa",
    label: "Defesa administrativa",
    description: "Defesa em processo administrativo.",
    suggestedDepth: "profissional",
  },
  {
    value: "recurso",
    label: "Recurso",
    description: "Interposição de recurso.",
    suggestedDepth: "profissional",
  },
  {
    value: "outro",
    label: "Outro",
    description: "Descrição livre.",
    suggestedDepth: "profissional",
  },
];

export function originLabel(origin: CaseOrigin): string {
  return CASE_ORIGINS.find((o) => o.value === origin)?.label ?? origin;
}
