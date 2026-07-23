"use client";

import { useActionState, useTransition } from "react";
import { addActionItemAction, updateActionItemStatusAction, type ActionItemFormState } from "@/lib/actions/case-management";
import type { ActionItemStatus, CaseActionItemRow } from "@/lib/types/database";

const STATUS_LABELS: Record<ActionItemStatus, string> = {
  pending: "Pendente",
  in_progress: "Em andamento",
  waiting_document: "Aguardando documento",
  waiting_decision: "Aguardando decisão",
  completed: "Concluída",
  cancelled: "Cancelada",
};

const STATUS_OPTIONS = Object.keys(STATUS_LABELS) as ActionItemStatus[];

const initialState: ActionItemFormState = { error: null };

export function ActionItemsPanel({ caseId, items }: { caseId: string; items: CaseActionItemRow[] }) {
  const boundAdd = addActionItemAction.bind(null, caseId);
  const [state, formAction, isPending] = useActionState(boundAdd, initialState);

  return (
    <div>
      {items.length === 0 ? (
        <p className="text-sm text-nexo-text-secondary">Nenhuma providência registrada.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <ActionItemRow key={item.id} caseId={caseId} item={item} />
          ))}
        </ul>
      )}

      <form action={formAction} className="mt-4 flex flex-col gap-2 sm:flex-row">
        <input
          type="text"
          name="description"
          placeholder="Nova providência..."
          required
          className="h-10 flex-1 rounded-nexo-field border border-nexo-border bg-white px-3.5 text-sm focus:border-nexo-lime-dark focus:outline-none"
        />
        <button
          type="submit"
          disabled={isPending}
          className="h-10 shrink-0 rounded-nexo-pill bg-nexo-black px-4 text-sm font-semibold text-white hover:bg-nexo-black-secondary disabled:opacity-50"
        >
          {isPending ? "Adicionando..." : "Adicionar"}
        </button>
      </form>
      {state.error && <p className="mt-1.5 text-xs font-medium text-nexo-error">{state.error}</p>}
    </div>
  );
}

function ActionItemRow({ caseId, item }: { caseId: string; item: CaseActionItemRow }) {
  const [isPending, startTransition] = useTransition();

  return (
    <li className="flex items-center justify-between gap-3 rounded-nexo-field border border-nexo-border px-3.5 py-2.5">
      <span className={`text-sm ${item.status === "completed" || item.status === "cancelled" ? "text-nexo-text-secondary line-through" : "text-nexo-text"}`}>
        {item.description}
      </span>
      <select
        defaultValue={item.status}
        disabled={isPending}
        onChange={(e) => {
          const status = e.target.value as ActionItemStatus;
          startTransition(async () => {
            await updateActionItemStatusAction(caseId, item.id, status);
          });
        }}
        className="h-8 shrink-0 rounded-nexo-field border border-nexo-border bg-white px-2 text-xs focus:border-nexo-lime-dark focus:outline-none"
      >
        {STATUS_OPTIONS.map((status) => (
          <option key={status} value={status}>
            {STATUS_LABELS[status]}
          </option>
        ))}
      </select>
    </li>
  );
}
