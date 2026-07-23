import type { CaseStatus } from "@/lib/types/database";

const LABELS: Record<CaseStatus, string> = {
  aguardando_analise: "Aguardando análise",
  em_producao: "Em produção",
  aguardando_decisao: "Aguardando decisão",
  pronto_protocolo: "Pronto para protocolo",
  concluido: "Concluído",
  arquivado: "Arquivado",
};

const TONES: Record<CaseStatus, string> = {
  aguardando_analise: "bg-nexo-text-secondary/10 text-nexo-text-secondary",
  em_producao: "bg-nexo-info/15 text-nexo-info",
  aguardando_decisao: "bg-nexo-warning/15 text-nexo-warning",
  pronto_protocolo: "bg-nexo-success/15 text-nexo-success",
  concluido: "bg-nexo-lime/25 text-nexo-lime-dark",
  arquivado: "bg-nexo-text-secondary/10 text-nexo-text-secondary",
};

export function CaseStatusBadge({ status }: { status: CaseStatus }) {
  return (
    <span className={`shrink-0 rounded-nexo-pill px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${TONES[status]}`}>
      {LABELS[status]}
    </span>
  );
}
