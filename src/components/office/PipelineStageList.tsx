import type { StageRunStatus } from "@/lib/types/database";

const STATUS_LABELS: Record<StageRunStatus, string> = {
  locked: "Bloqueada",
  ready: "Pronta para iniciar",
  queued: "Na fila",
  processing: "Em processamento",
  awaiting_review: "Aguardando revisão",
  changes_requested: "Alterações solicitadas",
  approved: "Aprovada",
  approved_with_notes: "Aprovada com ressalvas",
  technical_error: "Erro técnico",
  outdated: "Desatualizada",
  cancelled: "Cancelada",
};

const STATUS_TONES: Record<StageRunStatus, string> = {
  locked: "bg-nexo-text-secondary/10 text-nexo-text-secondary",
  ready: "bg-nexo-info/15 text-nexo-info",
  queued: "bg-nexo-info/15 text-nexo-info",
  processing: "bg-nexo-warning/15 text-nexo-warning",
  awaiting_review: "bg-nexo-warning/15 text-nexo-warning",
  changes_requested: "bg-nexo-warning/15 text-nexo-warning",
  approved: "bg-nexo-success/15 text-nexo-success",
  approved_with_notes: "bg-nexo-success/15 text-nexo-success",
  technical_error: "bg-nexo-error/15 text-nexo-error",
  outdated: "bg-nexo-text-secondary/10 text-nexo-text-secondary",
  cancelled: "bg-nexo-text-secondary/10 text-nexo-text-secondary",
};

export function PipelineStageList({
  stages,
}: {
  stages: { id: string; stage_order: number; status: StageRunStatus; name: string; specialist: string }[];
}) {
  if (stages.length === 0) {
    return <p className="text-sm text-nexo-text-secondary">Nenhuma etapa configurada para este caso.</p>;
  }

  return (
    <ol className="space-y-2">
      {stages.map((stage) => (
        <li key={stage.id} className="flex items-center justify-between gap-3 rounded-nexo-field border border-nexo-border px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-nexo-panel-bg text-xs font-bold text-nexo-text-secondary">
              {stage.stage_order}
            </span>
            <div>
              <p className="text-sm font-medium text-nexo-text">{stage.name}</p>
              <p className="text-xs text-nexo-text-secondary">{stage.specialist}</p>
            </div>
          </div>
          <span className={`shrink-0 rounded-nexo-pill px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${STATUS_TONES[stage.status]}`}>
            {STATUS_LABELS[stage.status]}
          </span>
        </li>
      ))}
    </ol>
  );
}
