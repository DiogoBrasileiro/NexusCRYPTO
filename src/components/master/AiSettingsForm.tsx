"use client";

import { useActionState, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { FormField, Input } from "@/components/ui/field";
import {
  saveAiSettingsAction,
  testAiCredentialAction,
  testAiModelAction,
  type AiSettingsActionState,
  type ProviderTestResult,
} from "@/lib/actions/master-ai-settings";
import type { GlobalAiSettingsRow } from "@/lib/types/database";

const initialState: AiSettingsActionState = { error: null };
const darkInput = "bg-nexo-black-secondary border-white/10 text-white placeholder:text-white/30";

export function AiSettingsForm({ settings }: { settings: GlobalAiSettingsRow }) {
  const [state, formAction, isPending] = useActionState(saveAiSettingsAction, initialState);
  const [isActive, setIsActive] = useState(settings.is_active);

  return (
    <form action={formAction} className="space-y-8" noValidate>
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-white/40">Provedor e modelo</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Provedor" htmlFor="provider">
            <Input id="provider" name="provider" defaultValue={settings.provider} required className={darkInput} />
          </FormField>
          <FormField label="Identificador técnico do modelo" htmlFor="model">
            <Input id="model" name="model" defaultValue={settings.model} required className={darkInput} />
          </FormField>
        </div>

        <div className="mt-4">
          <FormField label="Chave de API" htmlFor="apiKey">
            <Input
              id="apiKey"
              name="apiKey"
              type="password"
              placeholder={settings.api_key_last_four ? `•••• •••• •••• ${settings.api_key_last_four}` : "Nenhuma chave salva"}
              className={darkInput}
              autoComplete="off"
            />
          </FormField>
          <p className="mt-1.5 text-xs text-white/40">
            Deixe em branco para manter a chave atual. A chave nunca é exibida novamente após salva.
          </p>
        </div>

        <label className="mt-4 flex items-center gap-2.5 text-sm text-white/80">
          <input
            type="checkbox"
            name="isActive"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="h-4 w-4 rounded border-white/20 bg-nexo-black-secondary accent-nexo-lime"
          />
          IA global ativa
        </label>
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-white/40">Limites e execução</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Máximo de tokens de saída" htmlFor="maxOutputTokens">
            <Input
              id="maxOutputTokens"
              name="maxOutputTokens"
              type="number"
              min={256}
              defaultValue={settings.max_output_tokens}
              className={darkInput}
            />
          </FormField>
          <FormField label="Timeout (segundos)" htmlFor="timeoutSeconds">
            <Input id="timeoutSeconds" name="timeoutSeconds" type="number" min={5} defaultValue={settings.timeout_seconds} className={darkInput} />
          </FormField>
          <FormField label="Tentativas" htmlFor="maxRetries">
            <Input id="maxRetries" name="maxRetries" type="number" min={0} defaultValue={settings.max_retries} className={darkInput} />
          </FormField>
          <FormField label="Limite global mensal (execuções)" htmlFor="globalMonthlyLimit">
            <Input
              id="globalMonthlyLimit"
              name="globalMonthlyLimit"
              type="number"
              min={1}
              defaultValue={settings.global_monthly_execution_limit}
              className={darkInput}
            />
          </FormField>
          <FormField label="Limite padrão por escritório (mensal)" htmlFor="defaultOfficeMonthlyLimit">
            <Input
              id="defaultOfficeMonthlyLimit"
              name="defaultOfficeMonthlyLimit"
              type="number"
              min={1}
              defaultValue={settings.default_office_monthly_limit}
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
          Configuração salva.
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-6">
        <TestButtons />
        <Button type="submit" disabled={isPending}>
          {isPending ? "Salvando..." : "Salvar"}
        </Button>
      </div>
    </form>
  );
}

function TestButtons() {
  const [credentialResult, setCredentialResult] = useState<ProviderTestResult | null>(null);
  const [modelResult, setModelResult] = useState<ProviderTestResult | null>(null);
  const [isCredentialPending, startCredentialTest] = useTransition();
  const [isModelPending, startModelTest] = useTransition();

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={isCredentialPending}
          onClick={() => startCredentialTest(async () => setCredentialResult(await testAiCredentialAction()))}
          className="rounded-nexo-pill border border-white/15 px-4 py-2 text-sm font-medium text-white hover:bg-white/5 disabled:opacity-50"
        >
          {isCredentialPending ? "Testando..." : "Testar credencial"}
        </button>
        <button
          type="button"
          disabled={isModelPending}
          onClick={() => startModelTest(async () => setModelResult(await testAiModelAction()))}
          className="rounded-nexo-pill border border-white/15 px-4 py-2 text-sm font-medium text-white hover:bg-white/5 disabled:opacity-50"
        >
          {isModelPending ? "Testando..." : "Testar modelo"}
        </button>
      </div>
      {credentialResult && (
        <p className={`text-xs font-medium ${credentialResult.ok ? "text-nexo-success" : "text-nexo-error"}`}>
          Credencial: {credentialResult.message}
        </p>
      )}
      {modelResult && (
        <p className={`text-xs font-medium ${modelResult.ok ? "text-nexo-success" : "text-nexo-error"}`}>
          Modelo: {modelResult.message}
        </p>
      )}
    </div>
  );
}
