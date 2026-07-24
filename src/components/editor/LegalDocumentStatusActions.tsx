"use client";

import { useState, useTransition } from "react";
import { updateLegalDocumentStatusAction } from "@/lib/actions/legal-documents";
import type { LegalDocumentStatus } from "@/lib/types/database";

const LABELS: Record<LegalDocumentStatus, string> = {
  draft: "Rascunho",
  waiting_review: "Aguardando revisão",
  changes_requested: "Alterações solicitadas",
  approved: "Aprovado",
  ready_to_file: "Pronto para protocolo",
  filed: "Protocolado",
  archived: "Arquivado",
};

const NEXT_STATUS: Partial<Record<LegalDocumentStatus, { status: LegalDocumentStatus; label: string }[]>> = {
  draft: [{ status: "waiting_review", label: "Enviar para revisão" }],
  waiting_review: [
    { status: "approved", label: "Aprovar" },
    { status: "changes_requested", label: "Solicitar alterações" },
  ],
  changes_requested: [{ status: "waiting_review", label: "Reenviar para revisão" }],
  approved: [{ status: "ready_to_file", label: "Marcar pronto para protocolo" }],
  ready_to_file: [{ status: "filed", label: "Registrar protocolo" }],
};

export function LegalDocumentStatusActions({ documentId, status }: { documentId: string; status: LegalDocumentStatus }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const options = NEXT_STATUS[status] ?? [];

  return (
    <div className="flex items-center gap-2">
      <span className="rounded-nexo-pill bg-nexo-panel-bg px-3 py-1.5 text-xs font-semibold text-nexo-text-secondary">
        {LABELS[status]}
      </span>
      {options.map((option) => (
        <button
          key={option.status}
          type="button"
          disabled={isPending}
          onClick={() => {
            setError(null);
            startTransition(async () => {
              const result = await updateLegalDocumentStatusAction(documentId, option.status);
              if (!result.ok) setError(result.error);
            });
          }}
          className="rounded-nexo-pill border border-nexo-border px-3.5 py-1.5 text-xs font-medium text-nexo-text hover:bg-nexo-panel-bg disabled:opacity-50"
        >
          {option.label}
        </button>
      ))}
      {error && <span className="text-xs font-medium text-nexo-error">{error}</span>}
    </div>
  );
}
