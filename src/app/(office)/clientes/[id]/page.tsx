import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireOfficeContext } from "@/lib/auth/office-context";
import { getClient } from "@/lib/data/clients";
import { ClientDangerActions } from "@/components/office/ClientDangerActions";
import { CaseStatusBadge } from "@/components/office/CaseStatusBadge";
import { formatDate } from "@/lib/utils/format";

export const metadata: Metadata = { title: "Cliente — NEXO Jurídico" };

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const context = await requireOfficeContext();
  const detail = await getClient(context.tenantId, id);
  if (!detail) notFound();

  const { client, cases } = detail;
  const name = client.full_name ?? client.company_name ?? "Cliente";

  return (
    <div className="mx-auto max-w-[900px]">
      <Link href="/clientes" className="text-sm text-nexo-text-secondary hover:text-nexo-text">
        ← Clientes
      </Link>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-nexo-text">{name}</h1>
          <p className="mt-1 text-sm text-nexo-text-secondary">
            {client.kind === "pessoa_fisica" ? "Pessoa física" : "Pessoa jurídica"} ·{" "}
            {client.cpf ?? client.cnpj ?? "Documento não informado"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/casos/novo?clienteId=${client.id}`}
            className="rounded-nexo-pill bg-nexo-lime px-4 py-2 text-sm font-semibold text-nexo-black hover:bg-nexo-lime-dark"
          >
            Criar caso
          </Link>
          <Link
            href={`/clientes/${client.id}/editar`}
            className="rounded-nexo-pill border border-nexo-border px-4 py-2 text-sm font-medium text-nexo-text hover:bg-nexo-panel-bg"
          >
            Editar
          </Link>
        </div>
      </div>

      <section className="mt-8 rounded-nexo-card border border-nexo-border bg-white p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-nexo-text-secondary">Dados</h2>
        <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
          <Field label="E-mail" value={client.email} />
          <Field label="Telefone" value={client.phone} />
          <Field label="WhatsApp" value={client.whatsapp} />
          <Field label="Endereço" value={client.address} />
          {client.kind === "pessoa_fisica" ? (
            <>
              <Field label="Nacionalidade" value={client.nationality} />
              <Field label="Estado civil" value={client.marital_status} />
              <Field label="Profissão" value={client.occupation} />
            </>
          ) : (
            <>
              <Field label="Nome fantasia" value={client.trade_name} />
              <Field label="Representante" value={client.representative_name} />
            </>
          )}
        </dl>
      </section>

      <section className="mt-6 rounded-nexo-card border border-nexo-border bg-white p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-nexo-text-secondary">Casos ({cases.length})</h2>
        {cases.length === 0 ? (
          <p className="mt-4 text-sm text-nexo-text-secondary">Nenhum caso vinculado a este cliente ainda.</p>
        ) : (
          <ul className="mt-4 divide-y divide-nexo-border">
            {cases.map((c) => (
              <li key={c.id}>
                <Link href={`/casos/${c.id}`} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-nexo-text">{c.title}</p>
                    <p className="text-xs text-nexo-text-secondary">
                      {c.code} · {formatDate(c.updated_at)}
                    </p>
                  </div>
                  <CaseStatusBadge status={c.status} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="mt-6 flex justify-end">
        <ClientDangerActions clientId={client.id} />
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
