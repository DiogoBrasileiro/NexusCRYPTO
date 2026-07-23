"use client";

import { useState, useTransition } from "react";
import { changeResponsibleAction } from "@/lib/actions/case-management";

export function ResponsibleSelect({
  caseId,
  currentLawyerId,
  members,
}: {
  caseId: string;
  currentLawyerId: string;
  members: { id: string; fullName: string }[];
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div>
      <select
        defaultValue={currentLawyerId}
        disabled={isPending}
        onChange={(e) => {
          const newId = e.target.value;
          setError(null);
          startTransition(async () => {
            try {
              await changeResponsibleAction(caseId, newId);
            } catch (err) {
              setError(err instanceof Error ? err.message : "Não foi possível alterar.");
            }
          });
        }}
        className="h-9 rounded-nexo-field border border-nexo-border bg-white px-2.5 text-sm focus:border-nexo-lime-dark focus:outline-none"
      >
        {members.map((m) => (
          <option key={m.id} value={m.id}>
            {m.fullName}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs font-medium text-nexo-error">{error}</p>}
    </div>
  );
}
