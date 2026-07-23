"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { FormField, Input } from "@/components/ui/field";
import { updatePasswordAction, type ActionState } from "@/lib/actions/auth";

const initialState: ActionState = { error: null };

export function ResetPasswordForm() {
  const [state, formAction, isPending] = useActionState(updatePasswordAction, initialState);

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <FormField label="Nova senha" htmlFor="password">
        <Input id="password" name="password" type="password" autoComplete="new-password" required minLength={8} />
      </FormField>

      <FormField label="Confirmar nova senha" htmlFor="confirmPassword">
        <Input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" required minLength={8} />
      </FormField>

      {state.error && (
        <p role="alert" className="rounded-nexo-field bg-nexo-error/10 px-3.5 py-2.5 text-sm font-medium text-nexo-error">
          {state.error}
        </p>
      )}

      <Button type="submit" disabled={isPending} className="w-full" size="lg">
        {isPending ? "Salvando..." : "Salvar nova senha"}
      </Button>
    </form>
  );
}
