import type { Metadata } from "next";
import Link from "next/link";
import { requireOfficeContext } from "@/lib/auth/office-context";
import { getMesaJuridicaData, type CaseSummary } from "@/lib/data/office";
import { formatDateTime } from "@/lib/utils/format";

export const metadata: Metadata = { title: "Mesa Jurídica — NEXO Jurídico" };

function greeting() {
  const hour = Number(
    new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", hour12: false, timeZone: "America/Sao_Paulo" }).format(
      new Date(),
    ),
  );
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

const ACTIVITY_LABELS: Record<string, string> = {
  case_created: "Caso criado",
  case_updated: "Caso atualizado",
  case_archived: "Caso arquivado",
  stage_approved: "Etapa aprovada",
  document_uploaded: "Documento anexado",
  legal_document_exported: "Peça exportada",
};

export default async function MesaJuridicaPage() {
  const context = await requireOfficeContext();
  const { quadrants, alerts, recentActivity } = await getMesaJuridicaData(context.tenantId);

  const pendingCount =
    quadrants.aguardandoAnalise.length +
    quadrants.emProducao.length +
    quadrants.aguardandoDecisao.length +
    quadrants.prontosProtocolo.length;

  const firstName = context.fullName.split(" ")[0];

  return (
    <div>
      <h1 className="text-2xl font-bold text-nexo-text">
        {greeting()}
        {firstName ? `, ${firstName}` : ""}.
      </h1>
      <p className="mt-1 text-sm text-nexo-text-secondary">
        {pendingCount > 0
          ? `Há ${pendingCount} item(ns) que precisam da sua atenção.`
          : "Nenhum item pendente no momento."}
      </p>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Quadrant
          icon="inbox"
          title="Aguardando análise"
          cases={quadrants.aguardandoAnalise}
          emptyLabel="Nenhum caso aguardando início."
        />
        <Quadrant icon="zap" title="Em produção" cases={quadrants.emProducao} emptyLabel="Nenhum caso em produção." />
        <Quadrant
          icon="clock"
          title="Aguardando sua decisão"
          cases={quadrants.aguardandoDecisao}
          emptyLabel="Nenhum caso aguardando sua decisão."
          badgeTone="warning"
        />
        <Quadrant
          icon="check"
          title="Prontos para protocolo"
          cases={quadrants.prontosProtocolo}
          emptyLabel="Nenhum caso pronto para protocolo."
          badgeTone="success"
        />
      </div>

      <section id="alertas" className="mt-8 rounded-nexo-card border border-nexo-border bg-white p-6">
        <h2 className="flex items-center gap-2 text-base font-semibold text-nexo-text">
          <span aria-hidden className="text-nexo-error">
            ⚠
          </span>
          Alertas importantes
        </h2>
        {alerts.length === 0 ? (
          <p className="mt-4 text-sm text-nexo-text-secondary">Nenhum alerta no momento.</p>
        ) : (
          <ul className="mt-4 divide-y divide-nexo-border">
            {alerts.map((alert) => (
              <li key={alert.id} className="flex items-center justify-between gap-3 py-3">
                <div>
                  <p className="text-sm font-medium text-nexo-text">Não foi possível concluir esta etapa.</p>
                  <p className="text-xs text-nexo-text-secondary">
                    {alert.caseCode ?? "Trabalho independente"} · {alert.taskType} · {formatDateTime(alert.createdAt)}
                  </p>
                </div>
                {alert.caseCode && (
                  <Link href="/casos" className="shrink-0 text-xs font-medium text-nexo-text hover:underline">
                    Ver caso
                  </Link>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-6 rounded-nexo-card border border-nexo-border bg-white p-6">
        <h2 className="text-base font-semibold text-nexo-text">Atividades recentes</h2>
        {recentActivity.length === 0 ? (
          <p className="mt-4 text-sm text-nexo-text-secondary">Nenhuma atividade registrada ainda.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {recentActivity.map((activity) => (
              <li key={activity.id} className="flex items-center justify-between text-sm">
                <span className="text-nexo-text-secondary">
                  {ACTIVITY_LABELS[activity.event_type] ?? activity.event_type}
                </span>
                <span className="text-xs text-nexo-text-secondary">{formatDateTime(activity.created_at)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Quadrant({
  icon,
  title,
  cases,
  emptyLabel,
  badgeTone,
}: {
  icon: "inbox" | "zap" | "clock" | "check";
  title: string;
  cases: CaseSummary[];
  emptyLabel: string;
  badgeTone?: "warning" | "success";
}) {
  return (
    <section className="rounded-nexo-card border border-nexo-border bg-white p-6">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-nexo-text-secondary">
          <QuadrantIcon icon={icon} />
          {title}
        </h2>
        {cases.length > 0 && (
          <span
            className={`rounded-nexo-pill px-2 py-0.5 text-xs font-bold ${
              badgeTone === "warning"
                ? "bg-nexo-warning/15 text-nexo-warning"
                : badgeTone === "success"
                  ? "bg-nexo-success/15 text-nexo-success"
                  : "bg-nexo-lime/20 text-nexo-lime-dark"
            }`}
          >
            {cases.length}
          </span>
        )}
      </div>

      {cases.length === 0 ? (
        <p className="mt-6 text-sm text-nexo-text-secondary">{emptyLabel}</p>
      ) : (
        <ul className="mt-4 divide-y divide-nexo-border">
          {cases.map((c) => (
            <li key={c.id}>
              <Link href={`/casos/${c.id}`} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-nexo-text">{c.title}</p>
                  <p className="text-xs text-nexo-text-secondary">{c.code}</p>
                </div>
                <span aria-hidden className="text-nexo-text-secondary">
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function QuadrantIcon({ icon }: { icon: "inbox" | "zap" | "clock" | "check" }) {
  const paths: Record<string, string> = {
    inbox: "M22 12h-6l-2 3h-4l-2-3H2M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z",
    zap: "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
    clock: "M12 22a10 10 0 100-20 10 10 0 000 20zM12 6v6l4 2",
    check: "M22 11.08V12a10 10 0 11-5.93-9.14M22 4L12 14.01l-3-3",
  };
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d={paths[icon]} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
