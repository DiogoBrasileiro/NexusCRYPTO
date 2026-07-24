import type { Metadata } from "next";
import Link from "next/link";
import { requireOfficeContext } from "@/lib/auth/office-context";
import { listClients } from "@/lib/data/clients";
import { formatDate } from "@/lib/utils/format";
import { Pagination } from "@/components/ui/pagination";

export const metadata: Metadata = { title: "Clientes — NEXO Jurídico" };

export default async function ClientsPage({ searchParams }: { searchParams: Promise<{ busca?: string; pagina?: string }> }) {
  const { busca, pagina } = await searchParams;
  const context = await requireOfficeContext();
  const page = Number(pagina) > 0 ? Number(pagina) : 1;
  const { clients, total, pageSize } = await listClients(context.tenantId, busca, page);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-nexo-text">Clientes</h1>
          <p className="mt-1 text-sm text-nexo-text-secondary">{total} cliente(s) cadastrado(s).</p>
        </div>
        <Link
          href="/clientes/novo"
          className="rounded-nexo-pill bg-nexo-lime px-5 py-2.5 text-sm font-semibold text-nexo-black hover:bg-nexo-lime-dark"
        >
          Novo cliente
        </Link>
      </div>

      <form className="mt-6 max-w-sm">
        <input
          type="search"
          name="busca"
          defaultValue={busca ?? ""}
          placeholder="Buscar por nome, documento ou e-mail"
          className="h-10 w-full rounded-nexo-field border border-nexo-border bg-white px-3.5 text-sm focus:border-nexo-lime-dark focus:outline-none"
        />
      </form>

      <div className="mt-6 overflow-x-auto rounded-nexo-card border border-nexo-border bg-white">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-nexo-border text-xs uppercase tracking-wide text-nexo-text-secondary">
              <th className="px-4 py-3 font-medium">Nome</th>
              <th className="px-4 py-3 font-medium">CPF/CNPJ</th>
              <th className="px-4 py-3 font-medium">E-mail</th>
              <th className="px-4 py-3 font-medium">Telefone</th>
              <th className="px-4 py-3 font-medium">Atualizado em</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-nexo-border">
            {clients.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-nexo-text-secondary">
                  {busca ? "Nenhum cliente encontrado para esta busca." : "Nenhum cliente cadastrado."}
                </td>
              </tr>
            ) : (
              clients.map((client) => (
                <tr key={client.id} className="hover:bg-nexo-panel-bg">
                  <td className="px-4 py-3">
                    <Link href={`/clientes/${client.id}`} className="font-medium text-nexo-text hover:underline">
                      {client.full_name ?? client.company_name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-nexo-text-secondary">{client.cpf ?? client.cnpj ?? "—"}</td>
                  <td className="px-4 py-3 text-nexo-text-secondary">{client.email ?? "—"}</td>
                  <td className="px-4 py-3 text-nexo-text-secondary">{client.phone ?? "—"}</td>
                  <td className="px-4 py-3 text-nexo-text-secondary">{formatDate(client.updated_at)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        buildHref={(p) => `/clientes?${new URLSearchParams({ ...(busca ? { busca } : {}), pagina: String(p) })}`}
      />
    </div>
  );
}
