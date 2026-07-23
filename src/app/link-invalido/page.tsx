import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Link inválido — NEXO Jurídico" };

export default function InvalidLinkPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-nexo-panel-bg px-4 py-12">
      <div className="w-full max-w-md rounded-nexo-card border border-nexo-border bg-white p-8 text-center shadow-sm">
        <h1 className="text-xl font-bold text-nexo-text">Este link não é mais válido</h1>
        <p className="mt-2 text-sm text-nexo-text-secondary">
          O link pode ter expirado ou já ter sido utilizado. Solicite um novo convite ou link de redefinição de senha.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-flex h-11 items-center justify-center rounded-nexo-pill bg-nexo-lime px-5 text-sm font-semibold text-nexo-black hover:bg-nexo-lime-dark"
        >
          Voltar para o login
        </Link>
      </div>
    </div>
  );
}
