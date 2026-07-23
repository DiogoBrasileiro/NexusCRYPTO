import type { MembershipRole } from "@/lib/types/database";

export const ROLE_LABELS: Record<MembershipRole, string> = {
  administrador: "Administrador",
  socio: "Sócio",
  advogado: "Advogado",
  revisor: "Revisor",
  assistente: "Assistente",
  estagiario: "Estagiário",
  somente_leitura: "Somente leitura",
};

export const ROLE_OPTIONS: MembershipRole[] = [
  "administrador",
  "socio",
  "advogado",
  "revisor",
  "assistente",
  "estagiario",
  "somente_leitura",
];
