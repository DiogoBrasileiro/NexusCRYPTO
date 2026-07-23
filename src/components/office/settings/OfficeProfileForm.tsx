"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { FormField, Input } from "@/components/ui/field";
import { updateOfficeProfileAction, type SettingsActionState } from "@/lib/actions/office-settings";
import type { OfficeProfileRow } from "@/lib/types/database";

const initialState: SettingsActionState = { error: null };

export function OfficeProfileForm({ profile }: { profile: OfficeProfileRow }) {
  const [state, formAction, isPending] = useActionState(updateOfficeProfileAction, initialState);

  return (
    <form action={formAction} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <FormField label="Nome" htmlFor="name">
        <Input id="name" name="name" defaultValue={profile.name} required />
      </FormField>
      <FormField label="Razão social" htmlFor="legalName">
        <Input id="legalName" name="legalName" defaultValue={profile.legal_name ?? ""} />
      </FormField>
      <FormField label="CNPJ" htmlFor="cnpj">
        <Input id="cnpj" name="cnpj" defaultValue={profile.cnpj ?? ""} />
      </FormField>
      <FormField label="Responsável" htmlFor="responsibleName">
        <Input id="responsibleName" name="responsibleName" defaultValue={profile.responsible_name} required />
      </FormField>
      <FormField label="OAB" htmlFor="oabNumber">
        <Input id="oabNumber" name="oabNumber" defaultValue={profile.oab_number ?? ""} />
      </FormField>
      <FormField label="E-mail" htmlFor="email">
        <Input id="email" name="email" type="email" defaultValue={profile.email ?? ""} />
      </FormField>
      <FormField label="Telefone" htmlFor="phone">
        <Input id="phone" name="phone" defaultValue={profile.phone ?? ""} />
      </FormField>
      <FormField label="WhatsApp" htmlFor="whatsapp">
        <Input id="whatsapp" name="whatsapp" defaultValue={profile.whatsapp ?? ""} />
      </FormField>
      <FormField label="Endereço" htmlFor="address">
        <Input id="address" name="address" defaultValue={profile.address ?? ""} />
      </FormField>
      <FormField label="Cidade" htmlFor="city">
        <Input id="city" name="city" defaultValue={profile.city ?? ""} />
      </FormField>
      <FormField label="Estado" htmlFor="state">
        <Input id="state" name="state" maxLength={2} defaultValue={profile.state ?? ""} />
      </FormField>
      <FormField label="CEP" htmlFor="cep">
        <Input id="cep" name="cep" defaultValue={profile.cep ?? ""} />
      </FormField>
      <FormField label="Site" htmlFor="website">
        <Input id="website" name="website" defaultValue={profile.website ?? ""} />
      </FormField>

      <div className="sm:col-span-2">
        {state.error && <p className="mb-3 text-sm font-medium text-nexo-error">{state.error}</p>}
        {state.success && <p className="mb-3 text-sm font-medium text-nexo-success">Dados salvos.</p>}
        <Button type="submit" disabled={isPending} size="sm">
          {isPending ? "Salvando..." : "Salvar"}
        </Button>
      </div>
    </form>
  );
}
