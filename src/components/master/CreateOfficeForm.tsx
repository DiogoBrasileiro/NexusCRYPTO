"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { FormField, Input, Label } from "@/components/ui/field";
import { createOfficeAction, type MasterActionState } from "@/lib/actions/master-offices";

const initialState: MasterActionState = { error: null };

const darkInput =
  "bg-nexo-black-secondary border-white/10 text-white placeholder:text-white/30";

export function CreateOfficeForm() {
  const [state, formAction, isPending] = useActionState(createOfficeAction, initialState);

  return (
    <form action={formAction} className="space-y-8" noValidate>
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-white/40">Dados do escritório</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Nome do escritório" htmlFor="officeName">
            <Input id="officeName" name="officeName" required className={darkInput} />
          </FormField>
          <FormField label="Razão social" htmlFor="legalName">
            <Input id="legalName" name="legalName" className={darkInput} />
          </FormField>
          <FormField label="CNPJ" htmlFor="cnpj">
            <Input id="cnpj" name="cnpj" className={darkInput} />
          </FormField>
          <FormField label="Telefone" htmlFor="phone">
            <Input id="phone" name="phone" className={darkInput} />
          </FormField>
          <FormField label="Cidade" htmlFor="city">
            <Input id="city" name="city" className={darkInput} />
          </FormField>
          <FormField label="Estado" htmlFor="state">
            <Input id="state" name="state" maxLength={2} placeholder="UF" className={darkInput} />
          </FormField>
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-white/40">Responsável</h2>
        <p className="mt-1 text-xs text-white/40">
          Este usuário recebe um e-mail para definir a senha e se torna administrador do escritório.
        </p>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Nome" htmlFor="responsibleName">
            <Input id="responsibleName" name="responsibleName" required className={darkInput} />
          </FormField>
          <FormField label="E-mail" htmlFor="responsibleEmail">
            <Input id="responsibleEmail" name="responsibleEmail" type="email" required className={darkInput} />
          </FormField>
          <FormField label="Cargo" htmlFor="responsibleRole">
            <Input id="responsibleRole" name="responsibleRole" className={darkInput} />
          </FormField>
          <FormField label="Telefone" htmlFor="responsiblePhone">
            <Input id="responsiblePhone" name="responsiblePhone" className={darkInput} />
          </FormField>
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-white/40">Limites</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Limite de usuários" htmlFor="userLimit">
            <Input id="userLimit" name="userLimit" type="number" min={1} defaultValue={10} className={darkInput} />
          </FormField>
          <FormField label="Limite mensal de execuções de IA" htmlFor="aiMonthlyLimit">
            <Input id="aiMonthlyLimit" name="aiMonthlyLimit" type="number" min={1} defaultValue={200} className={darkInput} />
          </FormField>
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-white/40">Status</h2>
        <div className="mt-4">
          <Label htmlFor="status">Status inicial</Label>
          <select
            id="status"
            name="status"
            defaultValue="active"
            className="h-11 rounded-nexo-field border border-white/10 bg-nexo-black-secondary px-3.5 text-sm text-white focus:border-nexo-lime-dark focus:outline-none"
          >
            <option value="active">Ativo</option>
            <option value="blocked">Bloqueado</option>
          </select>
        </div>
      </section>

      {state.error && (
        <p role="alert" className="rounded-nexo-field bg-nexo-error/10 px-3.5 py-2.5 text-sm font-medium text-nexo-error">
          {state.error}
        </p>
      )}

      <div className="flex justify-end gap-3 border-t border-white/10 pt-6">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Criando..." : "Criar escritório e enviar convite"}
        </Button>
      </div>
    </form>
  );
}
