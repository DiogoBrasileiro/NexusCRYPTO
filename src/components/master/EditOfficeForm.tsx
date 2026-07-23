"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { FormField, Input } from "@/components/ui/field";
import { updateOfficeAction, type MasterActionState } from "@/lib/actions/master-offices";
import type { OfficeProfileRow, TenantRow } from "@/lib/types/database";

const initialState: MasterActionState = { error: null };
const darkInput = "bg-nexo-black-secondary border-white/10 text-white placeholder:text-white/30";

export function EditOfficeForm({ tenant, profile }: { tenant: TenantRow; profile: OfficeProfileRow }) {
  const boundAction = updateOfficeAction.bind(null, tenant.id);
  const [state, formAction, isPending] = useActionState(boundAction, initialState);

  return (
    <form action={formAction} className="space-y-8" noValidate>
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-white/40">Dados do escritório</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Nome do escritório" htmlFor="officeName">
            <Input id="officeName" name="officeName" defaultValue={profile.name} required className={darkInput} />
          </FormField>
          <FormField label="Razão social" htmlFor="legalName">
            <Input id="legalName" name="legalName" defaultValue={profile.legal_name ?? ""} className={darkInput} />
          </FormField>
          <FormField label="CNPJ" htmlFor="cnpj">
            <Input id="cnpj" name="cnpj" defaultValue={profile.cnpj ?? ""} className={darkInput} />
          </FormField>
          <FormField label="Telefone" htmlFor="phone">
            <Input id="phone" name="phone" defaultValue={profile.phone ?? ""} className={darkInput} />
          </FormField>
          <FormField label="WhatsApp" htmlFor="whatsapp">
            <Input id="whatsapp" name="whatsapp" defaultValue={profile.whatsapp ?? ""} className={darkInput} />
          </FormField>
          <FormField label="E-mail" htmlFor="email">
            <Input id="email" name="email" type="email" defaultValue={profile.email ?? ""} className={darkInput} />
          </FormField>
          <FormField label="Site" htmlFor="website">
            <Input id="website" name="website" defaultValue={profile.website ?? ""} className={darkInput} />
          </FormField>
          <FormField label="Cidade" htmlFor="city">
            <Input id="city" name="city" defaultValue={profile.city ?? ""} className={darkInput} />
          </FormField>
          <FormField label="Estado" htmlFor="state">
            <Input id="state" name="state" maxLength={2} defaultValue={profile.state ?? ""} className={darkInput} />
          </FormField>
          <FormField label="CEP" htmlFor="cep">
            <Input id="cep" name="cep" defaultValue={profile.cep ?? ""} className={darkInput} />
          </FormField>
          <FormField label="Endereço" htmlFor="address">
            <Input id="address" name="address" defaultValue={profile.address ?? ""} className={darkInput} />
          </FormField>
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-white/40">Responsável</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Nome" htmlFor="responsibleName">
            <Input id="responsibleName" name="responsibleName" defaultValue={profile.responsible_name} required className={darkInput} />
          </FormField>
          <FormField label="E-mail" htmlFor="responsibleEmail">
            <Input
              id="responsibleEmail"
              name="responsibleEmail"
              type="email"
              defaultValue={profile.responsible_email}
              required
              className={darkInput}
            />
          </FormField>
          <FormField label="Cargo" htmlFor="responsibleRole">
            <Input id="responsibleRole" name="responsibleRole" defaultValue={profile.responsible_role ?? ""} className={darkInput} />
          </FormField>
          <FormField label="Telefone" htmlFor="responsiblePhone">
            <Input id="responsiblePhone" name="responsiblePhone" defaultValue={profile.responsible_phone ?? ""} className={darkInput} />
          </FormField>
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-white/40">Limites</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Limite de usuários" htmlFor="userLimit">
            <Input id="userLimit" name="userLimit" type="number" min={1} defaultValue={profile.user_limit} className={darkInput} />
          </FormField>
          <FormField label="Limite mensal de execuções de IA" htmlFor="aiMonthlyLimit">
            <Input
              id="aiMonthlyLimit"
              name="aiMonthlyLimit"
              type="number"
              min={1}
              defaultValue={tenant.ai_monthly_execution_limit}
              className={darkInput}
            />
          </FormField>
        </div>
      </section>

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

      <div className="flex justify-end gap-3 border-t border-white/10 pt-6">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Salvando..." : "Salvar alterações"}
        </Button>
      </div>
    </form>
  );
}
