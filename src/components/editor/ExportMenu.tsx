"use client";

import { useState, useTransition } from "react";
import { getDocumentPlainTextAction } from "@/lib/actions/export";

export function ExportMenu({ documentId }: { documentId: string }) {
  const [isPending, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    startTransition(async () => {
      const text = await getDocumentPlainTextAction(documentId);
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleCopy}
        disabled={isPending}
        className="rounded-nexo-pill border border-nexo-border px-3.5 py-1.5 text-xs font-medium text-nexo-text hover:bg-nexo-panel-bg disabled:opacity-50"
      >
        {copied ? "Copiado" : "Copiar texto"}
      </button>
      <a
        href={`/api/documentos/${documentId}/export?format=pdf`}
        className="rounded-nexo-pill border border-nexo-border px-3.5 py-1.5 text-xs font-medium text-nexo-text hover:bg-nexo-panel-bg"
      >
        Baixar PDF
      </a>
      <a
        href={`/api/documentos/${documentId}/export?format=docx`}
        className="rounded-nexo-pill border border-nexo-border px-3.5 py-1.5 text-xs font-medium text-nexo-text hover:bg-nexo-panel-bg"
      >
        Baixar DOCX
      </a>
    </div>
  );
}
