"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FormField, Input } from "@/components/ui/field";
import type { ActionState } from "@/lib/actions/auth";

const initialState: ActionState = { error: null };

export function LoginForm({
  action,
  variant,
  forgotPasswordHref,
}: {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  variant: "light" | "dark";
  forgotPasswordHref: string;
}) {
  const [state, formAction, isPending] = useActionState(action, initialState);
  const isDark = variant === "dark";

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <FormField label="E-mail" htmlFor="email">
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="voce@escritorio.com.br"
          required
          className={isDark ? "bg-nexo-black-secondary border-white/10 text-white placeholder:text-white/30" : undefined}
        />
      </FormField>

      <FormField label="Senha" htmlFor="password">
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          required
          className={isDark ? "bg-nexo-black-secondary border-white/10 text-white placeholder:text-white/30" : undefined}
        />
      </FormField>

      <div className="flex items-center justify-end">
        <Link
          href={forgotPasswordHref}
          className={isDark ? "text-sm text-nexo-lime hover:underline" : "text-sm text-nexo-text-secondary hover:text-nexo-text"}
        >
          Esqueci minha senha
        </Link>
      </div>

      {state.error && (
        <p role="alert" className="rounded-nexo-field bg-nexo-error/10 px-3.5 py-2.5 text-sm font-medium text-nexo-error">
          {state.error}
        </p>
      )}

      <Button type="submit" disabled={isPending} className="w-full" size="lg">
        {isPending ? "Entrando..." : "Entrar"}
      </Button>
    </form>
  );
}
