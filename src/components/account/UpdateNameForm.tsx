"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { FormField, Input } from "@/components/ui/field";
import { updateProfileNameAction, type AccountActionState } from "@/lib/actions/account";

const initialState: AccountActionState = { error: null };

export function UpdateNameForm({ fullName, dark = false }: { fullName: string; dark?: boolean }) {
  const [state, formAction, isPending] = useActionState(updateProfileNameAction, initialState);
  const inputClass = dark ? "bg-nexo-black-secondary border-white/10 text-white" : undefined;

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <FormField label="Nome" htmlFor="fullName">
        <Input id="fullName" name="fullName" defaultValue={fullName} required className={inputClass} />
      </FormField>

      {state.error && <p className="text-sm font-medium text-nexo-error">{state.error}</p>}
      {state.success && <p className="text-sm font-medium text-nexo-success">Nome atualizado.</p>}

      <Button type="submit" disabled={isPending} size="sm">
        {isPending ? "Salvando..." : "Salvar nome"}
      </Button>
    </form>
  );
}
