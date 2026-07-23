"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { FormField, Input } from "@/components/ui/field";
import type { ClientActionState } from "@/lib/actions/clients";
import type { ClientRow } from "@/lib/types/database";
import { cn } from "@/lib/utils/cn";

const initialState: ClientActionState = { error: null };

export function ClientForm({
  action,
  initial,
  submitLabel,
}: {
  action: (prevState: ClientActionState, formData: FormData) => Promise<ClientActionState>;
  initial?: ClientRow;
  submitLabel: string;
}) {
  const [state, formAction, isPending] = useActionState(action, initialState);
  const [kind, setKind] = useState<"pessoa_fisica" | "pessoa_juridica">(initial?.kind ?? "pessoa_fisica");

  return (
    <form action={formAction} className="space-y-6" noValidate>
      <input type="hidden" name="kind" value={kind} />

      <div className="flex gap-2">
        {(["pessoa_fisica", "pessoa_juridica"] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setKind(option)}
            className={cn(
              "rounded-nexo-pill px-4 py-2 text-sm font-semibold",
              kind === option ? "bg-nexo-black text-white" : "border border-nexo-border text-nexo-text-secondary",
            )}
          >
            {option === "pessoa_fisica" ? "Pessoa Física" : "Pessoa Jurídica"}
          </button>
        ))}
      </div>

      {kind === "pessoa_fisica" ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Nome completo" htmlFor="fullName">
            <Input id="fullName" name="fullName" defaultValue={initial?.full_name ?? ""} required />
          </FormField>
          <FormField label="CPF" htmlFor="cpf">
            <Input id="cpf" name="cpf" defaultValue={initial?.cpf ?? ""} />
          </FormField>
          <FormField label="Nacionalidade" htmlFor="nationality">
            <Input id="nationality" name="nationality" defaultValue={initial?.nationality ?? ""} />
          </FormField>
          <FormField label="Estado civil" htmlFor="maritalStatus">
            <Input id="maritalStatus" name="maritalStatus" defaultValue={initial?.marital_status ?? ""} />
          </FormField>
          <FormField label="Profissão" htmlFor="occupation">
            <Input id="occupation" name="occupation" defaultValue={initial?.occupation ?? ""} />
          </FormField>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Razão social" htmlFor="companyName">
            <Input id="companyName" name="companyName" defaultValue={initial?.company_name ?? ""} required />
          </FormField>
          <FormField label="Nome fantasia" htmlFor="tradeName">
            <Input id="tradeName" name="tradeName" defaultValue={initial?.trade_name ?? ""} />
          </FormField>
          <FormField label="CNPJ" htmlFor="cnpj">
            <Input id="cnpj" name="cnpj" defaultValue={initial?.cnpj ?? ""} />
          </FormField>
          <FormField label="Representante" htmlFor="representativeName">
            <Input id="representativeName" name="representativeName" defaultValue={initial?.representative_name ?? ""} />
          </FormField>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="E-mail" htmlFor="email">
          <Input id="email" name="email" type="email" defaultValue={initial?.email ?? ""} />
        </FormField>
        <FormField label="Telefone" htmlFor="phone">
          <Input id="phone" name="phone" defaultValue={initial?.phone ?? ""} />
        </FormField>
        <FormField label="WhatsApp" htmlFor="whatsapp">
          <Input id="whatsapp" name="whatsapp" defaultValue={initial?.whatsapp ?? ""} />
        </FormField>
        <FormField label="Endereço" htmlFor="address">
          <Input id="address" name="address" defaultValue={initial?.address ?? ""} />
        </FormField>
      </div>

      {state.error && (
        <p role="alert" className="rounded-nexo-field bg-nexo-error/10 px-3.5 py-2.5 text-sm font-medium text-nexo-error">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="rounded-nexo-field bg-nexo-success/10 px-3.5 py-2.5 text-sm font-medium text-nexo-success">
          Alterações salvas.
        </p>
      )}

      <div className="flex justify-end border-t border-nexo-border pt-6">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Salvando..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
