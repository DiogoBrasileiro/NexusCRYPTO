import { z } from "zod";

export const caseCreateSchema = z.object({
  origin: z.enum([
    "consulta_inicial",
    "notificacao_judicial",
    "processo_em_andamento",
    "contrato_para_analise",
    "cobranca_extrajudicial",
    "parecer_juridico",
    "defesa_administrativa",
    "recurso",
    "outro",
  ]),
  legalArea: z.string().trim().min(1, "Selecione a área do direito."),
  legalSubarea: z.string().trim().optional(),
  clientId: z.string().trim().min(1, "Selecione o cliente."),
  counterpartyName: z.string().trim().optional(),
  counterpartyDocument: z.string().trim().optional(),
  counterpartyAddress: z.string().trim().optional(),
  counterpartyQualification: z.string().trim().optional(),
  responsibleLawyerId: z.string().trim().min(1, "Selecione o advogado responsável."),
  team: z.string().trim().optional(),
  title: z.string().trim().min(3, "Informe o título do caso."),
  shortSummary: z.string().trim().optional(),
  fullDescription: z.string().trim().min(20, "Descreva o caso com mais detalhes (mínimo 20 caracteres)."),
  clientObjective: z.string().trim().optional(),
  expectedOutcome: z.string().trim().optional(),
  urgency: z.string().trim().optional(),
  notes: z.string().trim().optional(),
  processNumber: z.string().trim().optional(),
  court: z.string().trim().optional(),
  district: z.string().trim().optional(),
  jurisdiction: z.string().trim().optional(),
  proceduralPhase: z.string().trim().optional(),
  caseValue: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? Number(v.replace(/\./g, "").replace(",", ".")) : undefined)),
  depth: z.enum(["rapida", "profissional", "completa"]),
  executionMode: z.enum(["supervisionado", "automatico"]),
});
