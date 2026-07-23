import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/auth/LoginForm";
import { signInOfficeAction } from "@/lib/actions/auth";

export const metadata: Metadata = { title: "Entrar — NEXO Jurídico" };

export default function LoginPage() {
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
          <h1 className="text-xl font-bold text-nexo-text">Acessar o painel do escritório</h1>
          <p className="mt-1 text-sm text-nexo-text-secondary">
            Entre com o e-mail e a senha do seu escritório.
          </p>

          <div className="mt-6">
            <LoginForm action={signInOfficeAction} variant="light" forgotPasswordHref="/esqueci-senha" />
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-nexo-text-secondary">
          Faz parte da administração da plataforma?{" "}
          <Link href="/master/login" className="font-medium text-nexo-text hover:underline">
            Acessar gestão da plataforma
          </Link>
        </p>
      </div>
    </div>
  );
}
