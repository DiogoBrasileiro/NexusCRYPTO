import { z } from "zod";

export const officeCreateSchema = z.object({
  officeName: z.string().trim().min(2, "Informe o nome do escritório."),
  legalName: z.string().trim().optional(),
  cnpj: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  city: z.string().trim().optional(),
  state: z.string().trim().max(2).optional(),
  responsibleName: z.string().trim().min(2, "Informe o nome do responsável."),
  responsibleEmail: z.string().trim().min(1, "Informe o e-mail do responsável.").email("E-mail inválido."),
  responsibleRole: z.string().trim().optional(),
  responsiblePhone: z.string().trim().optional(),
  userLimit: z.coerce.number().int().min(1).max(500).default(10),
  aiMonthlyLimit: z.coerce.number().int().min(1).max(100000).default(200),
  status: z.enum(["active", "blocked"]).default("active"),
});

export const officeUpdateSchema = z.object({
  officeName: z.string().trim().min(2, "Informe o nome do escritório."),
  legalName: z.string().trim().optional(),
  cnpj: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  whatsapp: z.string().trim().optional(),
  email: z.string().trim().optional(),
  website: z.string().trim().optional(),
  city: z.string().trim().optional(),
  state: z.string().trim().max(2).optional(),
  cep: z.string().trim().optional(),
  address: z.string().trim().optional(),
  responsibleName: z.string().trim().min(2, "Informe o nome do responsável."),
  responsibleEmail: z.string().trim().min(1, "Informe o e-mail do responsável.").email("E-mail inválido."),
  responsibleRole: z.string().trim().optional(),
  responsiblePhone: z.string().trim().optional(),
  userLimit: z.coerce.number().int().min(1).max(500),
  aiMonthlyLimit: z.coerce.number().int().min(1).max(100000),
});

export const aiSettingsSchema = z.object({
  provider: z.string().trim().min(1, "Informe o provedor."),
  model: z.string().trim().min(1, "Informe o identificador técnico do modelo."),
  apiKey: z.string().trim().optional(),
  isActive: z.coerce.boolean().default(false),
  maxOutputTokens: z.coerce.number().int().min(256).max(200000),
  timeoutSeconds: z.coerce.number().int().min(5).max(600),
  maxRetries: z.coerce.number().int().min(0).max(10),
  globalMonthlyLimit: z.coerce.number().int().min(1),
  defaultOfficeMonthlyLimit: z.coerce.number().int().min(1),
});
