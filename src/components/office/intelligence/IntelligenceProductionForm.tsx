"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/field";
import { produceDocumentAction, type IntelligenceActionState } from "@/lib/actions/intelligence";
import type { IntelligenceTask } from "@/lib/ai/intelligence-tasks";

const initialState: IntelligenceActionState = { error: null };

type CaseOption = { id: string; label: string };

export function IntelligenceProductionForm({
  task,
  cases,
  defaultCaseId,
}: {
  task: IntelligenceTask;
  cases: CaseOption[];
  defaultCaseId?: string;
}) {
  const [state, formAction, isPending] = useActionState(produceDocumentAction, initialState);

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="taskKey" value={task.key} />

      <div>
        <Label htmlFor="caseId">Caso (opcional)</Label>
        <select
          id="caseId"
          name="caseId"
          defaultValue={defaultCaseId ?? ""}
          className="h-11 w-full rounded-nexo-field border border-nexo-border bg-white px-3.5 text-sm focus:border-nexo-lime-dark focus:outline-none"
        >
          <option value="">Trabalho independente (sem caso vinculado)</option>
          {cases.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
        <p className="mt-1.5 text-xs text-nexo-text-secondary">
          Vincular a um caso dá à IA acesso ao dossiê e ao trabalho já aprovado nesse caso.
        </p>
      </div>

      <div>
        <Label htmlFor="objective">Objetivo</Label>
        <textarea
          id="objective"
          name="objective"
          required
          rows={3}
          placeholder="Descreva o que você precisa desta produção."
          className="w-full rounded-nexo-field border border-nexo-border bg-white px-3.5 py-2.5 text-sm focus:border-nexo-lime-dark focus:outline-none"
        />
      </div>

      <div>
        <Label htmlFor="instructions">Instruções adicionais</Label>
        <textarea
          id="instructions"
          name="instructions"
          rows={3}
          placeholder="Opcional: tom, pontos a enfatizar, restrições."
          className="w-full rounded-nexo-field border border-nexo-border bg-white px-3.5 py-2.5 text-sm focus:border-nexo-lime-dark focus:outline-none"
        />
      </div>

      {state.error && (
        <p role="alert" className="rounded-nexo-field bg-nexo-error/10 px-3.5 py-2.5 text-sm font-medium text-nexo-error">
          {state.error}
        </p>
      )}

      <div className="flex justify-end border-t border-nexo-border pt-6">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Produzindo documento..." : "Executar"}
        </Button>
      </div>
    </form>
  );
}
