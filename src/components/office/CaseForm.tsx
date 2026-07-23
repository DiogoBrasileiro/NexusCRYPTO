"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { FormField, Input, Label } from "@/components/ui/field";
import { createCaseAction, type CaseActionState } from "@/lib/actions/cases";
import { CASE_ORIGINS, originLabel } from "@/lib/domain/case-origins";
import { LEGAL_AREAS } from "@/lib/domain/legal-areas";
import type { CaseDepth, CaseOrigin } from "@/lib/types/database";
import { cn } from "@/lib/utils/cn";

const initialState: CaseActionState = { error: null };

const DEPTH_OPTIONS: { value: CaseDepth; label: string; stages: string; description: string; recommended?: boolean }[] = [
  { value: "rapida", label: "Rápida", stages: "5 etapas", description: "Consultas, contratos simples, notificações, cobranças." },
  { value: "profissional", label: "Profissional", stages: "8 etapas", description: "Casos com investigação e estratégia completas.", recommended: true },
  { value: "completa", label: "Completa", stages: "12 etapas", description: "Mesa de estratégia, simulação e laboratório de validação." },
];

type ClientOption = { id: string; label: string };
type MemberOption = { id: string; fullName: string };

export function CaseForm({
  origin,
  clients,
  members,
  defaultClientId,
}: {
  origin: CaseOrigin;
  clients: ClientOption[];
  members: MemberOption[];
  defaultClientId?: string;
}) {
  const [state, formAction, isPending] = useActionState(createCaseAction, initialState);
  const suggestedDepth = CASE_ORIGINS.find((o) => o.value === origin)?.suggestedDepth ?? "profissional";

  return (
    <form action={formAction} className="space-y-10" noValidate>
      <input type="hidden" name="origin" value={origin} />

      <section>
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-nexo-text-secondary">Classificação</h2>
          <span className="rounded-nexo-pill bg-nexo-panel-bg px-2.5 py-0.5 text-xs font-medium text-nexo-text-secondary">
            Origem: {originLabel(origin)}
          </span>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Área do Direito" htmlFor="legalArea">
            <select id="legalArea" name="legalArea" required className="h-11 w-full rounded-nexo-field border border-nexo-border bg-white px-3.5 text-sm focus:border-nexo-lime-dark focus:outline-none">
              <option value="">Selecionar...</option>
              {LEGAL_AREAS.map((area) => (
                <option key={area.code} value={area.label}>
                  {area.label}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Subárea" htmlFor="legalSubarea">
            <Input id="legalSubarea" name="legalSubarea" placeholder="Opcional" />
          </FormField>
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-nexo-text-secondary">Cliente</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Cliente" htmlFor="clientId">
            <select
              id="clientId"
              name="clientId"
              required
              defaultValue={defaultClientId ?? ""}
              className="h-11 w-full rounded-nexo-field border border-nexo-border bg-white px-3.5 text-sm focus:border-nexo-lime-dark focus:outline-none"
            >
              <option value="">Selecionar cliente existente...</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.label}
                </option>
              ))}
            </select>
          </FormField>
          <div className="flex items-end">
            <a
              href="/clientes/novo"
              target="_blank"
              rel="noreferrer"
              className="text-sm font-medium text-nexo-text hover:underline"
            >
              + Cadastrar novo cliente (abre em nova aba)
            </a>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-nexo-text-secondary">Parte contrária</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Nome" htmlFor="counterpartyName">
            <Input id="counterpartyName" name="counterpartyName" placeholder="Quem é o outro lado" />
          </FormField>
          <FormField label="CPF/CNPJ" htmlFor="counterpartyDocument">
            <Input id="counterpartyDocument" name="counterpartyDocument" />
          </FormField>
          <FormField label="Endereço" htmlFor="counterpartyAddress">
            <Input id="counterpartyAddress" name="counterpartyAddress" />
          </FormField>
          <FormField label="Qualificação" htmlFor="counterpartyQualification">
            <Input id="counterpartyQualification" name="counterpartyQualification" />
          </FormField>
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-nexo-text-secondary">Responsabilidade</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Advogado responsável" htmlFor="responsibleLawyerId">
            <select
              id="responsibleLawyerId"
              name="responsibleLawyerId"
              required
              className="h-11 w-full rounded-nexo-field border border-nexo-border bg-white px-3.5 text-sm focus:border-nexo-lime-dark focus:outline-none"
            >
              <option value="">Selecionar advogado responsável...</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.fullName}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Equipe" htmlFor="team">
            <Input id="team" name="team" placeholder="Equipe responsável (opcional)" />
          </FormField>
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-nexo-text-secondary">Detalhes do caso</h2>
        <div className="mt-4 space-y-4">
          <FormField label="Título" htmlFor="title">
            <Input id="title" name="title" required placeholder="Ex: Cobrança de taxas condominiais" />
          </FormField>
          <FormField label="Resumo curto" htmlFor="shortSummary">
            <Input id="shortSummary" name="shortSummary" placeholder="Uma frase que resume o caso" />
          </FormField>
          <div>
            <Label htmlFor="fullDescription">Descrição completa (obrigatório — usada por toda a cadeia de inteligência)</Label>
            <textarea
              id="fullDescription"
              name="fullDescription"
              required
              rows={6}
              placeholder="Explique detalhadamente tudo que aconteceu. Quanto mais detalhes, mais precisa será toda a cadeia de inteligência jurídica."
              className="w-full rounded-nexo-field border border-nexo-border bg-white px-3.5 py-2.5 text-sm focus:border-nexo-lime-dark focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Objetivo do cliente" htmlFor="clientObjective">
              <Input id="clientObjective" name="clientObjective" />
            </FormField>
            <FormField label="Resultado esperado" htmlFor="expectedOutcome">
              <Input id="expectedOutcome" name="expectedOutcome" />
            </FormField>
            <FormField label="Urgência" htmlFor="urgency">
              <Input id="urgency" name="urgency" placeholder="Ex: Há prazo em 5 dias" />
            </FormField>
          </div>
          <div>
            <Label htmlFor="notes">Observações</Label>
            <textarea id="notes" name="notes" rows={3} className="w-full rounded-nexo-field border border-nexo-border bg-white px-3.5 py-2.5 text-sm focus:border-nexo-lime-dark focus:outline-none" />
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-nexo-text-secondary">Processo</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Número" htmlFor="processNumber">
            <Input id="processNumber" name="processNumber" />
          </FormField>
          <FormField label="Vara" htmlFor="court">
            <Input id="court" name="court" />
          </FormField>
          <FormField label="Comarca" htmlFor="district">
            <Input id="district" name="district" />
          </FormField>
          <FormField label="Tribunal" htmlFor="jurisdiction">
            <Input id="jurisdiction" name="jurisdiction" />
          </FormField>
          <FormField label="Fase processual" htmlFor="proceduralPhase">
            <Input id="proceduralPhase" name="proceduralPhase" />
          </FormField>
          <FormField label="Valor da causa" htmlFor="caseValue">
            <Input id="caseValue" name="caseValue" placeholder="0,00" inputMode="decimal" />
          </FormField>
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-nexo-text-secondary">Configuração da análise</h2>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {DEPTH_OPTIONS.map((option) => (
            <label
              key={option.value}
              className="relative flex cursor-pointer flex-col rounded-nexo-card border border-nexo-border bg-white p-4 has-[:checked]:border-nexo-lime-dark has-[:checked]:ring-2 has-[:checked]:ring-nexo-lime/40"
            >
              <input
                type="radio"
                name="depth"
                value={option.value}
                defaultChecked={option.value === suggestedDepth}
                className="absolute right-3 top-3"
              />
              <span className="text-sm font-semibold text-nexo-text">{option.label}</span>
              <span className="text-xs text-nexo-text-secondary">{option.stages}</span>
              {option.recommended && (
                <span className="mt-1 w-fit rounded-nexo-pill bg-nexo-lime/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-nexo-lime-dark">
                  Recomendada
                </span>
              )}
              <span className="mt-2 text-xs leading-relaxed text-nexo-text-secondary">{option.description}</span>
            </label>
          ))}
        </div>

        <div className="mt-5 flex gap-4">
          <label className={cn("flex items-center gap-2 text-sm text-nexo-text")}>
            <input type="radio" name="executionMode" value="supervisionado" defaultChecked /> Supervisionado
          </label>
          <label className="flex items-center gap-2 text-sm text-nexo-text">
            <input type="radio" name="executionMode" value="automatico" /> Automático
          </label>
        </div>
      </section>

      {state.error && (
        <p role="alert" className="rounded-nexo-field bg-nexo-error/10 px-3.5 py-2.5 text-sm font-medium text-nexo-error">
          {state.error}
        </p>
      )}

      <div className="flex justify-end border-t border-nexo-border pt-6">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Criando caso..." : "Criar caso"}
        </Button>
      </div>
    </form>
  );
}
