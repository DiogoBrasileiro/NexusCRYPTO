"use client";

import { useState, useTransition } from "react";
import { setOfficeStatusAction } from "@/lib/actions/master-offices";
import type { OfficeStatus } from "@/lib/types/database";

export function OfficeStatusActions({ tenantId, status }: { tenantId: string; status: OfficeStatus }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const nextStatus: OfficeStatus = status === "active" ? "blocked" : "active";
  const label = status === "active" ? "Bloquear escritório" : "Reativar escritório";
  const confirmMessage =
    status === "active"
      ? "Bloquear este escritório? O acesso de todos os usuários será suspenso imediatamente, mas nenhum dado é apagado."
      : "Reativar o acesso deste escritório?";

  function handleClick() {
    if (!window.confirm(confirmMessage)) return;
    setError(null);
    startTransition(async () => {
      try {
        await setOfficeStatusAction(tenantId, nextStatus);
      } catch {
        setError("Não foi possível atualizar o status. Tente novamente.");
      }
    });
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className={`rounded-nexo-pill px-4 py-2 text-sm font-semibold disabled:opacity-50 ${
          status === "active"
            ? "border border-nexo-error/40 text-nexo-error hover:bg-nexo-error/10"
            : "bg-nexo-lime text-nexo-black hover:bg-nexo-lime-dark"
        }`}
      >
        {isPending ? "Atualizando..." : label}
      </button>
      {error && <p className="mt-2 text-xs font-medium text-nexo-error">{error}</p>}
    </div>
  );
}
