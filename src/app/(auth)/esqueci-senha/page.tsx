import type { Metadata } from "next";
import Link from "next/link";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = { title: "Esqueci minha senha — NEXO Jurídico" };

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-nexo-panel-bg px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-nexo-lime text-sm font-bold text-nexo-black">
              N
            </span>
            <span className="text-lg font-bold text-nexo-text">Nexo</span>
          </Link>
        </div>

        <div className="rounded-nexo-card border border-nexo-border bg-white p-8 shadow-sm">
          <h1 className="text-xl font-bold text-nexo-text">Redefinir senha</h1>
          <p className="mt-1 text-sm text-nexo-text-secondary">
            Informe o e-mail da sua conta. Enviaremos um link seguro para você criar uma nova senha.
          </p>

          <div className="mt-6">
            <ForgotPasswordForm />
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-nexo-text-secondary">
          <Link href="/login" className="font-medium text-nexo-text hover:underline">
            Voltar para o login
          </Link>
        </p>
      </div>
    </div>
  );
}
