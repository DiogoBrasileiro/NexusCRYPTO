import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireOfficeContext } from "@/lib/auth/office-context";
import { getCaseDetail, listActiveMembers } from "@/lib/data/cases";
import { CaseStatusBadge } from "@/components/office/CaseStatusBadge";
import { Tabs } from "@/components/ui/tabs";
import { CaseDangerActions } from "@/components/office/CaseDangerActions";
import { ResponsibleSelect } from "@/components/office/ResponsibleSelect";
import { ActionItemsPanel } from "@/components/office/ActionItemsPanel";
import { CaseDocumentsPanel } from "@/components/office/CaseDocumentsPanel";
import { PipelineStagesPanel } from "@/components/office/pipeline/PipelineStagesPanel";
import { originLabel } from "@/lib/domain/case-origins";
import { formatDate, formatDateTime } from "@/lib/utils/format";

export const metadata: Metadata = { title: "Caso — NEXO Jurídico" };

const ACTIVITY_LABELS: Record<string, string> = {
  case_created: "Caso criado",
  case_updated: "Caso atualizado",
  case_archived: "Caso arquivado",
  case_unarchived: "Caso reativado",
  case_deleted: "Caso excluído",
  case_duplicated: "Caso duplicado",
  case_responsible_changed: "Responsável alterado",
  document_uploaded: "Documento anexado",
  document_deleted: "Documento excluído",
};

export default async function CaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const context = await requireOfficeContext();
  const [detail, members] = await Promise.all([
    getCaseDetail(context.tenantId, id),
    listActiveMembers(context.tenantId),
  ]);
  if (!detail) notFound();

  const { case: caseRow, client, lawyer, actionItems, stages, documents, auditTrail, legalDocuments } = detail;
  const clientName = client?.full_name ?? client?.company_name ?? "Cliente";

  return (
    <div className="mx-auto max-w-[980px]">
      <Link href="/casos" className="text-sm text-nexo-text-secondary hover:text-nexo-text">
        ← Casos
      </Link>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-nexo-text">{caseRow.title}</h1>
            <CaseStatusBadge status={caseRow.status} />
          </div>
          <p className="mt-1 text-sm text-nexo-text-secondary">
            {caseRow.code} · {caseRow.legal_area} · {clientName}
          </p>
        </div>
        <CaseDangerActions caseId={caseRow.id} status={caseRow.status} />
      </div>

      <div className="mt-8">
        <Tabs
          tabs={[
            {
              key: "resumo",
              label: "Resumo",
              content: (
                <div className="space-y-6">
                  <section className="rounded-nexo-card border border-nexo-border bg-white p-6">
                    <h2 className="text-sm font-semibold uppercase tracking-wide text-nexo-text-secondary">Dados gerais</h2>
                    <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
                      <Field label="Origem" value={originLabel(caseRow.origin)} />
                      <Field label="Cliente" value={clientName} />
                      <Field label="Parte contrária" value={caseRow.counterparty_name} />
                      <Field label="Objetivo do cliente" value={caseRow.client_objective} />
                      <Field label="Resultado esperado" value={caseRow.expected_outcome} />
                      <Field label="Urgência" value={caseRow.urgency} />
                      <Field label="Última atualização" value={formatDate(caseRow.updated_at)} />
                      <Field label="Profundidade" value={caseRow.depth} />
                    </dl>
                    <div className="mt-4">
                      <p className="text-xs text-nexo-text-secondary">Descrição completa</p>
                      <p className="mt-1 whitespace-pre-wrap text-sm text-nexo-text">{caseRow.full_description}</p>
                    </div>
                  </section>

                  <section className="rounded-nexo-card border border-nexo-border bg-white p-6">
                    <h2 className="text-sm font-semibold uppercase tracking-wide text-nexo-text-secondary">Responsável</h2>
                    <div className="mt-3">
                      <ResponsibleSelect caseId={caseRow.id} currentLawyerId={caseRow.responsible_lawyer_id} members={members} />
                      {lawyer && <p className="mt-1 text-xs text-nexo-text-secondary">Atual: {lawyer.full_name}</p>}
                    </div>
                  </section>

                  <section className="rounded-nexo-card border border-nexo-border bg-white p-6">
                    <h2 className="text-sm font-semibold uppercase tracking-wide text-nexo-text-secondary">Plano de ação</h2>
                    <div className="mt-4">
                      <ActionItemsPanel caseId={caseRow.id} items={actionItems} />
                    </div>
                  </section>
                </div>
              ),
            },
            {
              key: "linha",
              label: "Linha Jurídica",
              content: (
                <section className="rounded-nexo-card border border-nexo-border bg-white p-6">
                  <p className="mb-4 text-xs text-nexo-text-secondary">
                    Modo {caseRow.execution_mode === "supervisionado" ? "supervisionado" : "automático"} · profundidade {caseRow.depth}.
                    Cada etapa é executada por um especialista de IA e aguarda sua aprovação antes de liberar a próxima.
                  </p>
                  <PipelineStagesPanel caseId={caseRow.id} stages={stages} />
                </section>
              ),
            },
            {
              key: "documentos",
              label: "Documentos",
              content: (
                <section className="rounded-nexo-card border border-nexo-border bg-white p-6">
                  <CaseDocumentsPanel caseId={caseRow.id} documents={documents} />
                </section>
              ),
            },
            {
              key: "pecas",
              label: "Peças",
              content: (
                <section className="rounded-nexo-card border border-nexo-border bg-white p-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold uppercase tracking-wide text-nexo-text-secondary">
                      Peças produzidas ({legalDocuments.length})
                    </h2>
                    <Link href="/central-inteligencia" className="text-xs font-medium text-nexo-text hover:underline">
                      Produzir nova peça
                    </Link>
                  </div>
                  {legalDocuments.length === 0 ? (
                    <p className="mt-4 text-sm text-nexo-text-secondary">Nenhuma peça produzida para este caso ainda.</p>
                  ) : (
                    <ul className="mt-4 divide-y divide-nexo-border">
                      {legalDocuments.map((doc) => (
                        <li key={doc.id}>
                          <Link href={`/documentos/${doc.id}`} className="flex items-center justify-between gap-3 py-3">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-nexo-text">{doc.title}</p>
                              <p className="text-xs text-nexo-text-secondary">
                                {doc.document_type} · {formatDate(doc.updated_at)}
                              </p>
                            </div>
                            <span className="shrink-0 rounded-nexo-pill bg-nexo-panel-bg px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-nexo-text-secondary">
                              {doc.status}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              ),
            },
            {
              key: "historico",
              label: "Histórico",
              content: (
                <section className="rounded-nexo-card border border-nexo-border bg-white p-6">
                  {auditTrail.length === 0 ? (
                    <p className="text-sm text-nexo-text-secondary">Nenhum evento registrado ainda.</p>
                  ) : (
                    <ul className="space-y-2">
                      {auditTrail.map((event) => (
                        <li key={event.id} className="flex items-center justify-between text-sm">
                          <span className="text-nexo-text-secondary">{ACTIVITY_LABELS[event.event_type] ?? event.event_type}</span>
                          <span className="text-xs text-nexo-text-secondary">{formatDateTime(event.created_at)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <dt className="text-xs text-nexo-text-secondary">{label}</dt>
      <dd className="mt-0.5 text-nexo-text">{value || "—"}</dd>
    </div>
  );
}
