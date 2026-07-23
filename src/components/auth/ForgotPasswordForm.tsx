"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { FormField, Input } from "@/components/ui/field";
import { requestPasswordResetAction, type ActionState } from "@/lib/actions/auth";

const initialState: ActionState = { error: null };

export function ForgotPasswordForm() {
  const [state, formAction, isPending] = useActionState(requestPasswordResetAction, initialState);

  if (state.success) {
    return (
      <p className="rounded-nexo-field bg-nexo-success/10 px-3.5 py-3 text-sm font-medium text-nexo-success">
        Se houver uma conta com este e-mail, enviamos um link para redefinir a senha.
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <FormField label="E-mail" htmlFor="email">
        <Input id="email" name="email" type="email" autoComplete="email" placeholder="voce@escritorio.com.br" required />
      </FormField>

      {state.error && (
        <p role="alert" className="rounded-nexo-field bg-nexo-error/10 px-3.5 py-2.5 text-sm font-medium text-nexo-error">
          {state.error}
        </p>
      )}

      <Button type="submit" disabled={isPending} className="w-full" size="lg">
        {isPending ? "Enviando..." : "Enviar link de redefinição"}
      </Button>
    </form>
  );
}
