"use client";

import { useState, useTransition } from "react";
import { resendInvitationAction } from "@/lib/actions/master-offices";

export function ResendInvitationButton({ tenantId, email }: { tenantId: string; email: string }) {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "sent" | "error">("idle");

  function handleClick() {
    setStatus("idle");
    startTransition(async () => {
      try {
        await resendInvitationAction(tenantId, email);
        setStatus("sent");
      } catch {
        setStatus("error");
      }
    });
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className="rounded-nexo-pill border border-white/15 px-3 py-1.5 text-xs font-medium text-white/70 hover:bg-white/5 disabled:opacity-50"
      >
        {isPending ? "Enviando..." : "Reenviar convite"}
      </button>
      {status === "sent" && <span className="text-xs text-nexo-success">Convite reenviado.</span>}
      {status === "error" && <span className="text-xs text-nexo-error">Falha ao reenviar.</span>}
    </div>
  );
}
