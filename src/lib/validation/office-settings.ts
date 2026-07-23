import { z } from "zod";

export const officeProfileSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome do escritório."),
  legalName: z.string().trim().optional(),
  cnpj: z.string().trim().optional(),
  responsibleName: z.string().trim().min(2, "Informe o nome do responsável."),
  oabNumber: z.string().trim().optional(),
  email: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  whatsapp: z.string().trim().optional(),
  address: z.string().trim().optional(),
  city: z.string().trim().optional(),
  state: z.string().trim().max(2).optional(),
  cep: z.string().trim().optional(),
  website: z.string().trim().optional(),
});

export const letterheadSchema = z.object({
  useLetterhead: z.coerce.boolean(),
  officeName: z.string().trim().optional(),
  legalName: z.string().trim().optional(),
  cnpj: z.string().trim().optional(),
  lawyerName: z.string().trim().optional(),
  oabNumber: z.string().trim().optional(),
  address: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  email: z.string().trim().optional(),
  website: z.string().trim().optional(),
  headerText: z.string().trim().optional(),
  footerText: z.string().trim().optional(),
  brandColor: z.string().trim().optional(),
});
