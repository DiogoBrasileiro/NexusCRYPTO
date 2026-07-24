"use client";

import { useState, useTransition } from "react";
import { runStageAction, approveStageAction, requestStageChangesAction } from "@/lib/actions/pipeline";
import { stageAnalysisSchema, type StageAnalysis } from "@/lib/ai/stage-analysis";
import { StageReport } from "@/components/office/pipeline/StageReport";
import type { StageRunStatus } from "@/lib/types/database";

const STATUS_LABELS: Record<StageRunStatus, string> = {
  locked: "Bloqueada",
  ready: "Pronta para iniciar",
  queued: "Na fila",
  processing: "Processando",
  awaiting_review: "Aguardando sua decisão",
  changes_requested: "Correção solicitada",
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

export type StageCardData = {
  id: string;
  stage_order: number;
  status: StageRunStatus;
  name: string;
  specialist: string;
  version: { content: Record<string, unknown> } | null;
  pendingNote: string | null;
};

export function StageCard({ caseId, stage }: { caseId: string; stage: StageCardData }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showCorrectionForm, setShowCorrectionForm] = useState(false);
  const [expanded, setExpanded] = useState(stage.status === "awaiting_review");

  const analysis: StageAnalysis | null = stage.version ? stageAnalysisSchema.safeParse(stage.version.content).data ?? null : null;

  const canRun = ["ready", "changes_requested", "technical_error", "outdated"].includes(stage.status);
  const canDecide = stage.status === "awaiting_review";
  const isLocked = stage.status === "locked";

  function handleRun() {
    setError(null);
    startTransition(async () => {
      const result = await runStageAction(caseId, stage.id);
      if (!result.ok) setError(result.error);
      else setExpanded(true);
    });
  }

  function handleApprove(withNotes: boolean) {
    setError(null);
    startTransition(async () => {
      const result = await approveStageAction(caseId, stage.id, withNotes);
      if (!result.ok) setError(result.error);
    });
  }

  function handleRequestChanges(formData: FormData) {
    const note = String(formData.get("note") ?? "");
    setError(null);
    startTransition(async () => {
      const result = await requestStageChangesAction(caseId, stage.id, note);
      if (!result.ok) setError(result.error);
      else setShowCorrectionForm(false);
    });
  }

  return (
    <div className={`rounded-nexo-card border ${isLocked ? "border-nexo-border bg-nexo-panel-bg" : "border-nexo-border bg-white"}`}>
      <button
        type="button"
        onClick={() => analysis && setExpanded((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-nexo-text-secondary ring-1 ring-nexo-border">
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
      </button>

      {stage.pendingNote && (
        <div className="mx-4 mb-3 rounded-nexo-field bg-nexo-warning/10 px-3.5 py-2.5 text-xs text-nexo-text">
          <span className="font-semibold">Correção solicitada: </span>
          {stage.pendingNote}
        </div>
      )}

      {expanded && analysis && (
        <div className="border-t border-nexo-border px-4 py-4">
          <StageReport analysis={analysis} />
        </div>
      )}

      {(canRun || canDecide) && (
        <div className="border-t border-nexo-border px-4 py-3">
          {error && <p className="mb-2 text-xs font-medium text-nexo-error">{error}</p>}

          {canRun && (
            <button
              type="button"
              onClick={handleRun}
              disabled={isPending}
              className="rounded-nexo-pill bg-nexo-black px-4 py-2 text-xs font-semibold text-white hover:bg-nexo-black-secondary disabled:opacity-50"
            >
              {isPending ? "Executando..." : stage.status === "ready" ? "Executar" : "Reexecutar"}
            </button>
          )}

          {canDecide && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handleApprove(false)}
                disabled={isPending}
                className="rounded-nexo-pill bg-nexo-lime px-4 py-2 text-xs font-semibold text-nexo-black hover:bg-nexo-lime-dark disabled:opacity-50"
              >
                Aprovar e avançar
              </button>
              <button
                type="button"
                onClick={() => handleApprove(true)}
                disabled={isPending}
                className="rounded-nexo-pill border border-nexo-border px-4 py-2 text-xs font-medium text-nexo-text hover:bg-nexo-panel-bg disabled:opacity-50"
              >
                Aprovar com ressalvas
              </button>
              <button
                type="button"
                onClick={handleRun}
                disabled={isPending}
                className="rounded-nexo-pill border border-nexo-border px-4 py-2 text-xs font-medium text-nexo-text hover:bg-nexo-panel-bg disabled:opacity-50"
              >
                Reexecutar
              </button>
              <button
                type="button"
                onClick={() => setShowCorrectionForm((v) => !v)}
                className="rounded-nexo-pill border border-nexo-border px-4 py-2 text-xs font-medium text-nexo-text hover:bg-nexo-panel-bg"
              >
                Solicitar correção
              </button>
            </div>
          )}

          {showCorrectionForm && (
            <form
              action={(formData) => handleRequestChanges(formData)}
              className="mt-3 flex flex-col gap-2 sm:flex-row"
            >
              <input
                type="text"
                name="note"
                required
                placeholder="O que precisa ser corrigido nesta etapa?"
                className="h-9 flex-1 rounded-nexo-field border border-nexo-border bg-white px-3 text-sm focus:border-nexo-lime-dark focus:outline-none"
              />
              <button
                type="submit"
                disabled={isPending}
                className="h-9 shrink-0 rounded-nexo-pill bg-nexo-black px-4 text-xs font-semibold text-white hover:bg-nexo-black-secondary disabled:opacity-50"
              >
                Enviar
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
