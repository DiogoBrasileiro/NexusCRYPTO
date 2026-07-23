import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export const metadata: Metadata = { title: "Definir nova senha — NEXO Jurídico" };

export default async function ResetPasswordPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

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
          {user ? (
            <>
              <h1 className="text-xl font-bold text-nexo-text">Defina sua nova senha</h1>
              <p className="mt-1 text-sm text-nexo-text-secondary">
                Escolha uma senha com pelo menos 8 caracteres.
              </p>
              <div className="mt-6">
                <ResetPasswordForm />
              </div>
            </>
          ) : (
            <>
              <h1 className="text-xl font-bold text-nexo-text">Link inválido ou expirado</h1>
              <p className="mt-2 text-sm text-nexo-text-secondary">
                Solicite um novo link de redefinição de senha para continuar.
              </p>
              <Link
                href="/esqueci-senha"
                className="mt-6 inline-flex h-11 items-center justify-center rounded-nexo-pill bg-nexo-lime px-5 text-sm font-semibold text-nexo-black hover:bg-nexo-lime-dark"
              >
                Solicitar novo link
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
