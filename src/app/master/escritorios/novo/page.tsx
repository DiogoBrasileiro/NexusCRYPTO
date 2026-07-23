import type { Metadata } from "next";
import Link from "next/link";
import { CreateOfficeForm } from "@/components/master/CreateOfficeForm";

export const metadata: Metadata = { title: "Novo escritório — Master — NEXO Jurídico" };

export default function NewOfficePage() {
  return (
    <div className="mx-auto max-w-[820px]">
      <Link href="/master/escritorios" className="text-sm text-white/50 hover:text-white">
        ← Escritórios
      </Link>
      <h1 className="mt-3 text-2xl font-bold text-white">Novo escritório</h1>
      <p className="mt-1 text-sm text-white/50">
        Ao salvar, criamos o ambiente isolado do escritório e enviamos um convite por e-mail para o responsável
        definir a senha de acesso.
      </p>

      <div className="mt-8 rounded-nexo-card border border-white/10 bg-white/[0.03] p-6 sm:p-8">
        <CreateOfficeForm />
      </div>
    </div>
  );
}
