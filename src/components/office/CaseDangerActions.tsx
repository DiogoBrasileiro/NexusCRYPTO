"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { archiveCaseAction, unarchiveCaseAction, deleteCaseAction, duplicateCaseAction } from "@/lib/actions/case-management";
import type { CaseStatus } from "@/lib/types/database";

export function CaseDangerActions({ caseId, status }: { caseId: string; status: CaseStatus }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function handleDuplicate() {
    setError(null);
    startTransition(async () => {
      try {
        await duplicateCaseAction(caseId);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Não foi possível duplicar.");
      }
    });
  }

  function handleArchiveToggle() {
    const isArchived = status === "arquivado";
    if (!window.confirm(isArchived ? "Reativar este caso?" : "Arquivar este caso? Nada é apagado.")) return;
    setError(null);
    startTransition(async () => {
      try {
        if (isArchived) await unarchiveCaseAction(caseId);
        else await archiveCaseAction(caseId);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Não foi possível atualizar o status.");
      }
    });
  }

  function handleDelete() {
    if (!window.confirm("Excluir definitivamente este caso? Esta ação não pode ser desfeita.")) return;
    setError(null);
    startTransition(async () => {
      try {
        await deleteCaseAction(caseId);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Não foi possível excluir.");
      }
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={handleDuplicate}
        disabled={isPending}
        className="rounded-nexo-pill border border-nexo-border px-3.5 py-1.5 text-xs font-medium text-nexo-text hover:bg-nexo-panel-bg disabled:opacity-50"
      >
        Duplicar
      </button>
      <button
        type="button"
        onClick={handleArchiveToggle}
        disabled={isPending}
        className="rounded-nexo-pill border border-nexo-border px-3.5 py-1.5 text-xs font-medium text-nexo-text hover:bg-nexo-panel-bg disabled:opacity-50"
      >
        {status === "arquivado" ? "Reativar" : "Arquivar"}
      </button>
      <button
        type="button"
        onClick={handleDelete}
        disabled={isPending}
        className="rounded-nexo-pill border border-nexo-error/30 px-3.5 py-1.5 text-xs font-medium text-nexo-error hover:bg-nexo-error/10 disabled:opacity-50"
      >
        Excluir
      </button>
      {error && <span className="text-xs font-medium text-nexo-error">{error}</span>}
    </div>
  );
}
