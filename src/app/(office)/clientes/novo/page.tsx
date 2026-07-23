import type { Metadata } from "next";
import Link from "next/link";
import { ClientForm } from "@/components/office/ClientForm";
import { createClientAction } from "@/lib/actions/clients";

export const metadata: Metadata = { title: "Novo cliente — NEXO Jurídico" };

export default function NewClientPage() {
  return (
    <div className="mx-auto max-w-[760px]">
      <Link href="/clientes" className="text-sm text-nexo-text-secondary hover:text-nexo-text">
        ← Clientes
      </Link>
      <h1 className="mt-3 text-2xl font-bold text-nexo-text">Novo cliente</h1>

      <div className="mt-8 rounded-nexo-card border border-nexo-border bg-white p-6 sm:p-8">
        <ClientForm action={createClientAction} submitLabel="Criar cliente" />
      </div>
    </div>
  );
}
