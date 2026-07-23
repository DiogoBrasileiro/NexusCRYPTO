import type { Metadata } from "next";
import Link from "next/link";
import { listOffices } from "@/lib/data/master";
import { OfficeStatusBadge } from "@/components/master/OfficeStatusBadge";
import { formatDate, formatDateTime } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

export const metadata: Metadata = { title: "Escritórios — Master — NEXO Jurídico" };

type FilterKey = "todos" | "ativos" | "bloqueados" | "sem_acesso" | "com_falha";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "todos", label: "Todos" },
  { key: "ativos", label: "Ativos" },
  { key: "bloqueados", label: "Bloqueados" },
  { key: "sem_acesso", label: "Sem acesso" },
  { key: "com_falha", label: "Com falha de IA" },
];

export default async function MasterOfficesPage({
  searchParams,
}: {
  searchParams: Promise<{ filtro?: string; busca?: string }>;
}) {
  const { filtro, busca } = await searchParams;
  const activeFilter: FilterKey = (FILTERS.some((f) => f.key === filtro) ? filtro : "todos") as FilterKey;
  const query = (busca ?? "").trim().toLowerCase();

  const offices = await listOffices();

  const filtered = offices.filter((office) => {
    if (activeFilter === "ativos" && office.status !== "active") return false;
    if (activeFilter === "bloqueados" && office.status !== "blocked") return false;
    if (activeFilter === "sem_acesso" && office.last_access_at) return false;
    if (activeFilter === "com_falha" && !office.has_ai_failure) return false;

    if (query) {
      const haystack = `${office.name} ${office.responsible_name} ${office.responsible_email}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }

    return true;
  });

  return (
    <div className="mx-auto max-w-[1180px]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Escritórios</h1>
          <p className="mt-1 text-sm text-white/50">{offices.length} escritório(s) cadastrado(s) na plataforma.</p>
        </div>
        <Link
          href="/master/escritorios/novo"
          className="rounded-nexo-pill bg-nexo-lime px-5 py-2.5 text-sm font-semibold text-nexo-black hover:bg-nexo-lime-dark"
        >
          Novo escritório
        </Link>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((filter) => (
            <Link
              key={filter.key}
              href={filter.key === "todos" ? "/master/escritorios" : `/master/escritorios?filtro=${filter.key}`}
              className={cn(
                "rounded-nexo-pill border px-3.5 py-1.5 text-xs font-medium",
                activeFilter === filter.key
                  ? "border-nexo-lime bg-nexo-lime text-nexo-black"
                  : "border-white/15 text-white/60 hover:bg-white/5",
              )}
            >
              {filter.label}
            </Link>
          ))}
        </div>

        <form className="ml-auto flex-1 min-w-[220px] max-w-xs">
          {activeFilter !== "todos" && <input type="hidden" name="filtro" value={activeFilter} />}
          <input
            type="search"
            name="busca"
            defaultValue={busca ?? ""}
            placeholder="Nome, responsável ou e-mail"
            className="h-10 w-full rounded-nexo-field border border-white/15 bg-white/[0.03] px-3.5 text-sm text-white placeholder:text-white/30 focus:border-nexo-lime-dark focus:outline-none"
          />
        </form>
      </div>

      <div className="mt-6 overflow-x-auto rounded-nexo-card border border-white/10">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-white/40">
              <th className="px-4 py-3 font-medium">Nome</th>
              <th className="px-4 py-3 font-medium">Responsável</th>
              <th className="px-4 py-3 font-medium">Usuários</th>
              <th className="px-4 py-3 font-medium">Casos</th>
              <th className="px-4 py-3 font-medium">Execuções no mês</th>
              <th className="px-4 py-3 font-medium">Último acesso</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sm text-white/40">
                  Nenhum escritório encontrado para este filtro.
                </td>
              </tr>
            ) : (
              filtered.map((office) => (
                <tr key={office.tenant_id} className="hover:bg-white/[0.03]">
                  <td className="px-4 py-3">
                    <Link href={`/master/escritorios/${office.tenant_id}`} className="font-medium text-white hover:underline">
                      {office.name}
                    </Link>
                    <p className="text-xs text-white/40">Desde {formatDate(office.created_at)}</p>
                  </td>
                  <td className="px-4 py-3 text-white/70">
                    {office.responsible_name}
                    <p className="text-xs text-white/40">{office.responsible_email}</p>
                  </td>
                  <td className="px-4 py-3 text-white/70">{office.user_count}</td>
                  <td className="px-4 py-3 text-white/70">{office.case_count}</td>
                  <td className="px-4 py-3 text-white/70">
                    {office.executions_this_month} / {office.execution_limit}
                  </td>
                  <td className="px-4 py-3 text-white/70">{formatDateTime(office.last_access_at)}</td>
                  <td className="px-4 py-3">
                    <OfficeStatusBadge status={office.status} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
