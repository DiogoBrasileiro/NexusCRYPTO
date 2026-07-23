import type { Metadata } from "next";
import Link from "next/link";
import { listAuditLogs, listDistinctAuditEventTypes } from "@/lib/data/master";
import { formatDateTime } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

export const metadata: Metadata = { title: "Auditoria — Master — NEXO Jurídico" };

export default async function MasterAuditPage({
  searchParams,
}: {
  searchParams: Promise<{ evento?: string; pagina?: string }>;
}) {
  const { evento, pagina } = await searchParams;
  const page = Number(pagina) > 0 ? Number(pagina) : 1;

  const [{ logs, total, pageSize }, eventTypes] = await Promise.all([
    listAuditLogs({ eventType: evento, page }),
    listDistinctAuditEventTypes(),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="mx-auto max-w-[1180px]">
      <h1 className="text-2xl font-bold text-white">Auditoria</h1>
      <p className="mt-1 text-sm text-white/50">{total} evento(s) registrado(s) na plataforma.</p>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href="/master/auditoria"
          className={cn(
            "rounded-nexo-pill border px-3.5 py-1.5 text-xs font-medium",
            !evento ? "border-nexo-lime bg-nexo-lime text-nexo-black" : "border-white/15 text-white/60 hover:bg-white/5",
          )}
        >
          Todos
        </Link>
        {eventTypes.map((type) => (
          <Link
            key={type}
            href={`/master/auditoria?evento=${encodeURIComponent(type)}`}
            className={cn(
              "rounded-nexo-pill border px-3.5 py-1.5 text-xs font-medium",
              evento === type ? "border-nexo-lime bg-nexo-lime text-nexo-black" : "border-white/15 text-white/60 hover:bg-white/5",
            )}
          >
            {type}
          </Link>
        ))}
      </div>

      <div className="mt-6 overflow-x-auto rounded-nexo-card border border-white/10">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-white/40">
              <th className="px-4 py-3 font-medium">Evento</th>
              <th className="px-4 py-3 font-medium">Escopo</th>
              <th className="px-4 py-3 font-medium">Entidade</th>
              <th className="px-4 py-3 font-medium">Data</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {logs.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-sm text-white/40">
                  Nenhum evento encontrado.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-white/[0.03]">
                  <td className="px-4 py-3 font-medium text-white">{log.event_type}</td>
                  <td className="px-4 py-3 text-white/60">{log.actor_scope ?? "—"}</td>
                  <td className="px-4 py-3 text-white/60">
                    {log.entity_type ? `${log.entity_type}${log.entity_id ? ` · ${log.entity_id.slice(0, 8)}` : ""}` : "—"}
                  </td>
                  <td className="px-4 py-3 text-white/60">{formatDateTime(log.created_at)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-white/50">
          <span>
            Página {page} de {totalPages}
          </span>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={`/master/auditoria?${new URLSearchParams({ ...(evento ? { evento } : {}), pagina: String(page - 1) })}`}
                className="rounded-nexo-pill border border-white/15 px-3.5 py-1.5 hover:bg-white/5"
              >
                Anterior
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={`/master/auditoria?${new URLSearchParams({ ...(evento ? { evento } : {}), pagina: String(page + 1) })}`}
                className="rounded-nexo-pill border border-white/15 px-3.5 py-1.5 hover:bg-white/5"
              >
                Próxima
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
