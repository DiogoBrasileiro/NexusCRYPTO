"use client";

import { useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";

export function EndOtherSessionsButton({ dark = false }: { dark?: boolean }) {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "done" | "error">("idle");

  function handleClick() {
    setStatus("idle");
    startTransition(async () => {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut({ scope: "others" });
      setStatus(error ? "error" : "done");
    });
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className={
          dark
            ? "rounded-nexo-pill border border-white/15 px-4 py-2 text-sm font-medium text-white hover:bg-white/5 disabled:opacity-50"
            : "rounded-nexo-pill border border-nexo-border px-4 py-2 text-sm font-medium text-nexo-text hover:bg-nexo-panel-bg disabled:opacity-50"
        }
      >
        {isPending ? "Encerrando..." : "Encerrar outras sessões"}
      </button>
      {status === "done" && <p className="mt-1.5 text-xs font-medium text-nexo-success">Outras sessões encerradas.</p>}
      {status === "error" && <p className="mt-1.5 text-xs font-medium text-nexo-error">Não foi possível encerrar.</p>}
    </div>
  );
}
