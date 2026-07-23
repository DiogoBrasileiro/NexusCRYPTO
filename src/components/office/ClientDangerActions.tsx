"use client";

import { useState, useTransition } from "react";
import { archiveClientAction, deleteClientAction } from "@/lib/actions/clients";

export function ClientDangerActions({ clientId }: { clientId: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleArchive() {
    if (!window.confirm("Arquivar este cliente? Ele deixará de aparecer nas listas ativas, mas nada é apagado.")) return;
    setError(null);
    startTransition(async () => {
      try {
        await archiveClientAction(clientId);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Não foi possível arquivar.");
      }
    });
  }

  function handleDelete() {
    if (!window.confirm("Excluir definitivamente este cliente? Esta ação não pode ser desfeita.")) return;
    setError(null);
    startTransition(async () => {
      try {
        await deleteClientAction(clientId);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Não foi possível excluir.");
      }
    });
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleArchive}
        disabled={isPending}
        className="rounded-nexo-pill border border-nexo-border px-3.5 py-1.5 text-xs font-medium text-nexo-text-secondary hover:bg-nexo-panel-bg disabled:opacity-50"
      >
        Arquivar
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
