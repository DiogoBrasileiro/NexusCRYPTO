"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { FormField, Input } from "@/components/ui/field";
import { inviteMemberAction, type TeamActionState } from "@/lib/actions/team";
import { ROLE_LABELS, ROLE_OPTIONS } from "@/lib/domain/roles";

const initialState: TeamActionState = { error: null };

export function InviteMemberForm() {
  const [state, formAction, isPending] = useActionState(inviteMemberAction, initialState);

  return (
    <form action={formAction} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <FormField label="Nome" htmlFor="fullName">
        <Input id="fullName" name="fullName" required />
      </FormField>
      <FormField label="E-mail" htmlFor="email">
        <Input id="email" name="email" type="email" required />
      </FormField>
      <FormField label="OAB" htmlFor="oabNumber">
        <Input id="oabNumber" name="oabNumber" placeholder="Opcional" />
      </FormField>
      <FormField label="Perfil" htmlFor="role">
        <select
          id="role"
          name="role"
          defaultValue="advogado"
          className="h-11 w-full rounded-nexo-field border border-nexo-border bg-white px-3.5 text-sm focus:border-nexo-lime-dark focus:outline-none"
        >
          {ROLE_OPTIONS.map((role) => (
            <option key={role} value={role}>
              {ROLE_LABELS[role]}
            </option>
          ))}
        </select>
      </FormField>

      <div className="sm:col-span-2">
        {state.error && <p className="mb-3 text-sm font-medium text-nexo-error">{state.error}</p>}
        {state.success && <p className="mb-3 text-sm font-medium text-nexo-success">Convite enviado.</p>}
        <Button type="submit" disabled={isPending}>
          {isPending ? "Enviando..." : "Enviar convite"}
        </Button>
      </div>
    </form>
  );
}
