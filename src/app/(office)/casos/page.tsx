import type { Metadata } from "next";
import Link from "next/link";
import { requireOfficeContext } from "@/lib/auth/office-context";
import { listCases } from "@/lib/data/cases";
import { CaseStatusBadge } from "@/components/office/CaseStatusBadge";
import { formatDate } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

export const metadata: Metadata = { title: "Casos — NEXO Jurídico" };

const FILTERS: { key: string; label: string }[] = [
  { key: "todos", label: "Todos" },
  { key: "aguardando_analise", label: "Aguardando análise" },
  { key: "em_producao", label: "Em produção" },
  { key: "aguardando_decisao", label: "Aguardando decisão" },
  { key: "pronto_protocolo", label: "Prontos para protocolo" },
  { key: "concluido", label: "Concluídos" },
  { key: "arquivados", label: "Arquivados" },
];

export default async function CasesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; busca?: string }>;
}) {
  const { status, busca } = await searchParams;
  const context = await requireOfficeContext();
  const activeFilter = FILTERS.some((f) => f.key === status) ? (status as string) : "todos";
  const cases = await listCases(context.tenantId, { status: activeFilter, search: busca });

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-nexo-text-secondary">Copiloto jurídico</p>
      <div className="mt-1 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-nexo-text">Casos</h1>
          <p className="mt-1 text-sm text-nexo-text-secondary">
            Centralize demandas jurídicas e inicie uma Linha de Produção Jurídica com inteligência artificial.
          </p>
        </div>
        <Link
          href="/casos/novo"
          className="rounded-nexo-pill bg-nexo-lime px-5 py-2.5 text-sm font-semibold text-nexo-black hover:bg-nexo-lime-dark"
        >
          Novo caso
        </Link>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((filter) => (
            <Link
              key={filter.key}
              href={filter.key === "todos" ? "/casos" : `/casos?status=${filter.key}`}
              className={cn(
                "rounded-nexo-pill border px-3.5 py-1.5 text-xs font-medium",
                activeFilter === filter.key
                  ? "border-nexo-black bg-nexo-black text-white"
                  : "border-nexo-border text-nexo-text-secondary hover:bg-nexo-panel-bg",
              )}
            >
              {filter.label}
            </Link>
          ))}
        </div>

        <form className="ml-auto max-w-xs flex-1">
          {activeFilter !== "todos" && <input type="hidden" name="status" value={activeFilter} />}
          <input
            type="search"
            name="busca"
            defaultValue={busca ?? ""}
            placeholder="Código, título, cliente ou área"
            className="h-10 w-full rounded-nexo-field border border-nexo-border bg-white px-3.5 text-sm focus:border-nexo-lime-dark focus:outline-none"
          />
        </form>
      </div>

      <div className="mt-6 overflow-x-auto rounded-nexo-card border border-nexo-border bg-white">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead>
            <tr className="border-b border-nexo-border text-xs uppercase tracking-wide text-nexo-text-secondary">
              <th className="px-4 py-3 font-medium">Código</th>
              <th className="px-4 py-3 font-medium">Título</th>
              <th className="px-4 py-3 font-medium">Cliente</th>
              <th className="px-4 py-3 font-medium">Área</th>
              <th className="px-4 py-3 font-medium">Responsável</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Atualizado em</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-nexo-border">
            {cases.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-nexo-text-secondary">
                  Nenhum caso encontrado.
                </td>
              </tr>
            ) : (
              cases.map((c) => (
                <tr key={c.id} className="hover:bg-nexo-panel-bg">
                  <td className="px-4 py-3">
                    <Link href={`/casos/${c.id}`} className="font-medium text-nexo-text hover:underline">
                      {c.code}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-nexo-text">{c.title}</td>
                  <td className="px-4 py-3 text-nexo-text-secondary">{c.clientName}</td>
                  <td className="px-4 py-3 text-nexo-text-secondary">{c.legal_area}</td>
                  <td className="px-4 py-3 text-nexo-text-secondary">{c.lawyerName}</td>
                  <td className="px-4 py-3">
                    <CaseStatusBadge status={c.status} />
                  </td>
                  <td className="px-4 py-3 text-nexo-text-secondary">{formatDate(c.updated_at)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
