import type { Metadata } from "next";
import Link from "next/link";
import { getSessionUser } from "@/lib/auth/session";
import { getOverviewStats, getRecentAiFailures, listOffices } from "@/lib/data/master";
import { StatCard } from "@/components/master/StatCard";
import { formatDate, formatDateTime } from "@/lib/utils/format";
import { OfficeStatusBadge } from "@/components/master/OfficeStatusBadge";

export const metadata: Metadata = { title: "Visão Geral — Master — NEXO Jurídico" };

export default async function MasterOverviewPage() {
  const [user, stats, failures, offices] = await Promise.all([
    getSessionUser(),
    getOverviewStats(),
    getRecentAiFailures(5),
    listOffices(),
  ]);

  const recentOffices = offices.slice(0, 5);
  const firstName = user?.fullName?.split(" ")[0];

  return (
    <div className="mx-auto max-w-[1180px]">
      <h1 className="text-2xl font-bold text-white">
        {firstName ? `Olá, ${firstName}.` : "Visão geral da plataforma"}
      </h1>
      <p className="mt-1 text-sm text-white/50">Panorama de todos os escritórios do NEXO Jurídico.</p>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <StatCard label="Escritórios ativos" value={stats.active_offices} />
        <StatCard label="Escritórios bloqueados" value={stats.blocked_offices} tone="warning" />
        <StatCard label="Usuários" value={stats.total_users} />
        <StatCard label="Clientes" value={stats.total_clients} />
        <StatCard label="Casos" value={stats.total_cases} />
        <StatCard label="Execuções de IA no mês" value={stats.executions_this_month} />
        <StatCard label="Falhas de IA" value={stats.ai_failures_this_month} tone="warning" />
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-nexo-card border border-white/10 bg-white/[0.03] p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-white">Escritórios recentes</h2>
            <Link href="/master/escritorios" className="text-xs font-medium text-nexo-lime hover:underline">
              Ver todos
            </Link>
          </div>

          {recentOffices.length === 0 ? (
            <p className="mt-6 text-sm text-white/40">Nenhum escritório cadastrado ainda.</p>
          ) : (
            <ul className="mt-4 divide-y divide-white/10">
              {recentOffices.map((office) => (
                <li key={office.tenant_id} className="py-3">
                  <Link href={`/master/escritorios/${office.tenant_id}`} className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-white">{office.name}</p>
                      <p className="truncate text-xs text-white/40">
                        {office.responsible_name} · {formatDate(office.created_at)}
                      </p>
                    </div>
                    <OfficeStatusBadge status={office.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-nexo-card border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-base font-semibold text-white">Falhas recentes</h2>
          {failures.length === 0 ? (
            <p className="mt-6 text-sm text-white/40">Nenhuma falha de IA registrada.</p>
          ) : (
            <ul className="mt-4 divide-y divide-white/10">
              {failures.map((failure) => (
                <li key={failure.id} className="py-3">
                  <p className="text-sm font-medium text-white">
                    {failure.tenant_name}
                    {failure.case_title ? ` · ${failure.case_title}` : ""}
                  </p>
                  <p className="mt-0.5 text-xs text-white/40">
                    {failure.task_type} · {failure.error_code ?? "erro técnico"} · {formatDateTime(failure.created_at)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="mt-6 rounded-nexo-card border border-white/10 bg-white/[0.03] p-6">
        <h2 className="text-base font-semibold text-white">Ações rápidas</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/master/escritorios/novo"
            className="rounded-nexo-pill bg-nexo-lime px-5 py-2.5 text-sm font-semibold text-nexo-black hover:bg-nexo-lime-dark"
          >
            Novo escritório
          </Link>
          <Link
            href="/master/configuracao-ia"
            className="rounded-nexo-pill border border-white/15 px-5 py-2.5 text-sm font-medium text-white hover:bg-white/5"
          >
            Configurar IA
          </Link>
          <Link
            href="/master/auditoria"
            className="rounded-nexo-pill border border-white/15 px-5 py-2.5 text-sm font-medium text-white hover:bg-white/5"
          >
            Ver auditoria
          </Link>
        </div>
      </section>
    </div>
  );
}
