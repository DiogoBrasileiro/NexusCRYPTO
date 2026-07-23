import { z } from "zod";

const base = {
  email: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  whatsapp: z.string().trim().optional(),
  address: z.string().trim().optional(),
};

export const clientPessoaFisicaSchema = z.object({
  kind: z.literal("pessoa_fisica"),
  fullName: z.string().trim().min(2, "Informe o nome completo."),
  cpf: z.string().trim().optional(),
  nationality: z.string().trim().optional(),
  maritalStatus: z.string().trim().optional(),
  occupation: z.string().trim().optional(),
  ...base,
});

export const clientPessoaJuridicaSchema = z.object({
  kind: z.literal("pessoa_juridica"),
  companyName: z.string().trim().min(2, "Informe a razão social."),
  tradeName: z.string().trim().optional(),
  cnpj: z.string().trim().optional(),
  representativeName: z.string().trim().optional(),
  ...base,
});

export const clientSchema = z.discriminatedUnion("kind", [clientPessoaFisicaSchema, clientPessoaJuridicaSchema]);
