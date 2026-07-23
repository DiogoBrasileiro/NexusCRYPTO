"use client";

import { useActionState, useState, useTransition } from "react";
import {
  uploadCaseDocumentAction,
  deleteCaseDocumentAction,
  getDocumentDownloadUrlAction,
  type DocumentActionState,
} from "@/lib/actions/case-documents";
import type { CaseDocumentRow, DocumentType } from "@/lib/types/database";
import { formatDateTime } from "@/lib/utils/format";

const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  identificacao: "Identificação",
  procuracao: "Procuração",
  contrato: "Contrato",
  comprovante: "Comprovante",
  comunicacao: "Comunicação",
  prova: "Prova",
  laudo: "Laudo",
  documento_judicial: "Documento judicial",
  peticao: "Petição",
  planilha: "Planilha",
  audio: "Áudio",
  imagem: "Imagem",
  outro: "Outro",
};

const initialState: DocumentActionState = { error: null };

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function CaseDocumentsPanel({
  caseId,
  documents,
}: {
  caseId: string;
  documents: Pick<CaseDocumentRow, "id" | "name" | "document_type" | "size_bytes" | "processing_status" | "created_at">[];
}) {
  const boundUpload = uploadCaseDocumentAction.bind(null, caseId);
  const [state, formAction, isPending] = useActionState(boundUpload, initialState);

  return (
    <div>
      <form action={formAction} className="flex flex-col gap-3 rounded-nexo-field border border-dashed border-nexo-border p-4 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-nexo-text-secondary">Arquivo</label>
          <input type="file" name="file" required className="text-sm" />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-nexo-text-secondary">Tipo</label>
          <select name="documentType" className="h-10 rounded-nexo-field border border-nexo-border bg-white px-2.5 text-sm focus:border-nexo-lime-dark focus:outline-none">
            {Object.entries(DOCUMENT_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="h-10 shrink-0 rounded-nexo-pill bg-nexo-black px-4 text-sm font-semibold text-white hover:bg-nexo-black-secondary disabled:opacity-50"
        >
          {isPending ? "Enviando..." : "Enviar"}
        </button>
      </form>
      {state.error && <p className="mt-2 text-xs font-medium text-nexo-error">{state.error}</p>}

      {documents.length === 0 ? (
        <p className="mt-4 text-sm text-nexo-text-secondary">Nenhum documento anexado ainda.</p>
      ) : (
        <ul className="mt-4 divide-y divide-nexo-border">
          {documents.map((doc) => (
            <DocumentRow key={doc.id} caseId={caseId} doc={doc} />
          ))}
        </ul>
      )}
    </div>
  );
}

function DocumentRow({
  caseId,
  doc,
}: {
  caseId: string;
  doc: Pick<CaseDocumentRow, "id" | "name" | "document_type" | "size_bytes" | "processing_status" | "created_at">;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleDownload() {
    setError(null);
    startTransition(async () => {
      try {
        const url = await getDocumentDownloadUrlAction(doc.id);
        window.open(url, "_blank", "noopener,noreferrer");
      } catch {
        setError("Não foi possível gerar o link.");
      }
    });
  }

  function handleDelete() {
    if (!window.confirm(`Excluir "${doc.name}"?`)) return;
    setError(null);
    startTransition(async () => {
      try {
        await deleteCaseDocumentAction(caseId, doc.id);
      } catch {
        setError("Não foi possível excluir.");
      }
    });
  }

  return (
    <li className="flex items-center justify-between gap-3 py-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-nexo-text">{doc.name}</p>
        <p className="text-xs text-nexo-text-secondary">
          {DOCUMENT_TYPE_LABELS[doc.document_type]} · {formatSize(doc.size_bytes)} · {formatDateTime(doc.created_at)}
        </p>
        {error && <p className="text-xs font-medium text-nexo-error">{error}</p>}
      </div>
      <div className="flex shrink-0 gap-2">
        <button type="button" onClick={handleDownload} disabled={isPending} className="text-xs font-medium text-nexo-text hover:underline disabled:opacity-50">
          Baixar
        </button>
        <button type="button" onClick={handleDelete} disabled={isPending} className="text-xs font-medium text-nexo-error hover:underline disabled:opacity-50">
          Excluir
        </button>
      </div>
    </li>
  );
}
