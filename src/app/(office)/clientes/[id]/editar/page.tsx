import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireOfficeContext } from "@/lib/auth/office-context";
import { getClient } from "@/lib/data/clients";
import { ClientForm } from "@/components/office/ClientForm";
import { updateClientAction } from "@/lib/actions/clients";

export const metadata: Metadata = { title: "Editar cliente — NEXO Jurídico" };

export default async function EditClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const context = await requireOfficeContext();
  const detail = await getClient(context.tenantId, id);
  if (!detail) notFound();

  const boundAction = updateClientAction.bind(null, id);

  return (
    <div className="mx-auto max-w-[760px]">
      <Link href={`/clientes/${id}`} className="text-sm text-nexo-text-secondary hover:text-nexo-text">
        ← {detail.client.full_name ?? detail.client.company_name}
      </Link>
      <h1 className="mt-3 text-2xl font-bold text-nexo-text">Editar cliente</h1>

      <div className="mt-8 rounded-nexo-card border border-nexo-border bg-white p-6 sm:p-8">
        <ClientForm action={boundAction} initial={detail.client} submitLabel="Salvar alterações" />
      </div>
    </div>
  );
}
