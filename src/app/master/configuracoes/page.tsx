import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { UpdateNameForm } from "@/components/account/UpdateNameForm";
import { ChangePasswordForm } from "@/components/account/ChangePasswordForm";

export const metadata: Metadata = { title: "Configurações — Master — NEXO Jurídico" };

export default async function MasterSettingsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/master/login");

  return (
    <div className="mx-auto max-w-[640px]">
      <h1 className="text-2xl font-bold text-white">Configurações</h1>
      <p className="mt-1 text-sm text-white/50">Dados da sua conta de administração da plataforma.</p>

      <section className="mt-8 rounded-nexo-card border border-white/10 bg-white/[0.03] p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-white/40">Minha conta</h2>
        <p className="mt-1 text-xs text-white/40">{user.email}</p>
        <div className="mt-4">
          <UpdateNameForm fullName={user.fullName} dark />
        </div>
      </section>

      <section className="mt-6 rounded-nexo-card border border-white/10 bg-white/[0.03] p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-white/40">Segurança</h2>
        <div className="mt-4">
          <ChangePasswordForm dark />
        </div>
      </section>
    </div>
  );
}
