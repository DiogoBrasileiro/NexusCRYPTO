"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { FormField, Input } from "@/components/ui/field";
import { changePasswordAction, type AccountActionState } from "@/lib/actions/account";

const initialState: AccountActionState = { error: null };

export function ChangePasswordForm({ dark = false }: { dark?: boolean }) {
  const [state, formAction, isPending] = useActionState(changePasswordAction, initialState);
  const inputClass = dark ? "bg-nexo-black-secondary border-white/10 text-white" : undefined;

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <FormField label="Senha atual" htmlFor="currentPassword">
        <Input id="currentPassword" name="currentPassword" type="password" autoComplete="current-password" required className={inputClass} />
      </FormField>
      <FormField label="Nova senha" htmlFor="newPassword">
        <Input id="newPassword" name="newPassword" type="password" autoComplete="new-password" required minLength={8} className={inputClass} />
      </FormField>
      <FormField label="Confirmar nova senha" htmlFor="confirmPassword">
        <Input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" required minLength={8} className={inputClass} />
      </FormField>

      {state.error && <p className="text-sm font-medium text-nexo-error">{state.error}</p>}
      {state.success && <p className="text-sm font-medium text-nexo-success">Senha alterada.</p>}

      <Button type="submit" disabled={isPending} size="sm">
        {isPending ? "Salvando..." : "Alterar senha"}
      </Button>
    </form>
  );
}
