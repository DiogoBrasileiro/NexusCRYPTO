import type { Metadata } from "next";
import Link from "next/link";
import { requireOfficeContext } from "@/lib/auth/office-context";
import { listClients } from "@/lib/data/clients";
import { listActiveMembers } from "@/lib/data/cases";
import { CaseIntakeOriginPicker } from "@/components/office/CaseIntakeOriginPicker";
import { CaseForm } from "@/components/office/CaseForm";
import { originLabel } from "@/lib/domain/case-origins";
import type { CaseOrigin } from "@/lib/types/database";

export const metadata: Metadata = { title: "Novo caso — NEXO Jurídico" };

const VALID_ORIGINS: CaseOrigin[] = [
  "consulta_inicial",
  "notificacao_judicial",
  "processo_em_andamento",
  "contrato_para_analise",
  "cobranca_extrajudicial",
  "parecer_juridico",
  "defesa_administrativa",
  "recurso",
  "outro",
];

export default async function NewCasePage({
  searchParams,
}: {
  searchParams: Promise<{ origem?: string; clienteId?: string }>;
}) {
  const { origem, clienteId } = await searchParams;
  const context = await requireOfficeContext();
  const origin = VALID_ORIGINS.find((o) => o === origem);

  if (!origin) {
    return (
      <div className="mx-auto max-w-[880px]">
        <p className="text-xs font-semibold uppercase tracking-wide text-nexo-text-secondary">Central de entrada de casos</p>
        <h1 className="mt-1 text-2xl font-bold text-nexo-text">Novo caso</h1>
        <div className="mt-8">
          <CaseIntakeOriginPicker clienteId={clienteId} />
        </div>
      </div>
    );
  }

  const [clients, members] = await Promise.all([
    listClients(context.tenantId),
    listActiveMembers(context.tenantId),
  ]);

  return (
    <div className="mx-auto max-w-[880px]">
      <Link href="/casos/novo" className="text-sm text-nexo-text-secondary hover:text-nexo-text">
        ← Alterar origem
      </Link>
      <h1 className="mt-3 text-2xl font-bold text-nexo-text">Cadastro do caso</h1>
      <p className="mt-1 text-sm text-nexo-text-secondary">Origem: {originLabel(origin)}</p>

      <div className="mt-8 rounded-nexo-card border border-nexo-border bg-white p-6 sm:p-8">
        <CaseForm
          origin={origin}
          clients={clients.map((c) => ({ id: c.id, label: c.full_name ?? c.company_name ?? "Cliente" }))}
          members={members}
          defaultClientId={clienteId}
        />
      </div>
    </div>
  );
}
