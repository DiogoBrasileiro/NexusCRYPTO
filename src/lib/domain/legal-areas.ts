export const LEGAL_AREAS = [
  { code: "CIV", label: "Civil" },
  { code: "CON", label: "Consumidor" },
  { code: "TRB", label: "Trabalhista" },
  { code: "EMP", label: "Empresarial" },
  { code: "CTR", label: "Contratual" },
  { code: "FAM", label: "Família" },
  { code: "SUC", label: "Sucessões" },
  { code: "CRI", label: "Criminal" },
  { code: "IMO", label: "Imobiliário" },
  { code: "BAN", label: "Bancário" },
  { code: "TRI", label: "Tributário" },
  { code: "ADM", label: "Administrativo" },
  { code: "PRE", label: "Previdenciário" },
  { code: "DIG", label: "Digital e LGPD" },
  { code: "SAU", label: "Saúde" },
  { code: "CDM", label: "Condominial" },
  { code: "OUT", label: "Outro" },
] as const;

export function areaCodeForLabel(label: string): string {
  return LEGAL_AREAS.find((a) => a.label === label)?.code ?? "OUT";
}
