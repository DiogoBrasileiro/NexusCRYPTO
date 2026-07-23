import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/auth/LoginForm";
import { signInMasterAction } from "@/lib/actions/auth";

export const metadata: Metadata = { title: "Gestão da plataforma — NEXO Jurídico" };

export default function MasterLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-nexo-black px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-nexo-lime text-sm font-bold text-nexo-black">
              N
            </span>
            <span className="text-lg font-bold text-white">Nexo</span>
          </Link>
          <span className="rounded-nexo-pill border border-nexo-lime/30 bg-nexo-lime/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-nexo-lime">
            Ambiente Master
          </span>
        </div>

        <div className="rounded-nexo-card border border-white/10 bg-nexo-black-secondary p-8 shadow-xl">
          <h1 className="text-xl font-bold text-white">Gestão da plataforma</h1>
          <p className="mt-1 text-sm text-white/50">
            Acesso restrito à administração do NEXO Jurídico.
          </p>

          <div className="mt-6">
            <LoginForm action={signInMasterAction} variant="dark" forgotPasswordHref="/esqueci-senha" />
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-white/40">
          <Link href="/" className="hover:text-white/70">
            Voltar ao site
          </Link>
        </p>
      </div>
    </div>
  );
}
