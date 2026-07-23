import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireOfficeContext, canManageOffice } from "@/lib/auth/office-context";
import { getOfficeProfile, getLetterheadSettings, getSignedLogoUrl, getUserTimezone } from "@/lib/data/office-settings";
import { Tabs } from "@/components/ui/tabs";
import { OfficeProfileForm } from "@/components/office/settings/OfficeProfileForm";
import { LogoUploadForm } from "@/components/office/settings/LogoUploadForm";
import { LetterheadForm } from "@/components/office/settings/LetterheadForm";
import { TimezoneForm } from "@/components/office/settings/TimezoneForm";
import { UpdateNameForm } from "@/components/account/UpdateNameForm";
import { ChangePasswordForm } from "@/components/account/ChangePasswordForm";
import { EndOtherSessionsButton } from "@/components/account/EndOtherSessionsButton";

export const metadata: Metadata = { title: "Configurações — NEXO Jurídico" };

export default async function OfficeSettingsPage() {
  const context = await requireOfficeContext();
  const [profile, letterhead, timezone] = await Promise.all([
    getOfficeProfile(context.tenantId),
    getLetterheadSettings(context.tenantId),
    getUserTimezone(context.userId),
  ]);
  if (!profile) notFound();

  const logoUrl = await getSignedLogoUrl(profile.logo_url);
  const canManage = canManageOffice(context.role);

  return (
    <div className="mx-auto max-w-[960px]">
      <h1 className="text-2xl font-bold text-nexo-text">Configurações</h1>

      <div className="mt-8">
        <Tabs
          tabs={[
            {
              key: "escritorio",
              label: "Escritório",
              content: (
                <div className="space-y-6">
                  <section className="rounded-nexo-card border border-nexo-border bg-white p-6">
                    <h2 className="text-sm font-semibold uppercase tracking-wide text-nexo-text-secondary">Logo</h2>
                    <div className="mt-4">
                      {canManage ? (
                        <LogoUploadForm logoUrl={logoUrl} />
                      ) : (
                        <p className="text-sm text-nexo-text-secondary">Apenas administradores podem alterar o logo.</p>
                      )}
                    </div>
                  </section>
                  <section className="rounded-nexo-card border border-nexo-border bg-white p-6">
                    {canManage ? (
                      <OfficeProfileForm profile={profile} />
                    ) : (
                      <p className="text-sm text-nexo-text-secondary">
                        Apenas administradores e sócios podem editar os dados do escritório.
                      </p>
                    )}
                  </section>
                </div>
              ),
            },
            {
              key: "timbrado",
              label: "Timbrado e documentos",
              content: (
                <section className="rounded-nexo-card border border-nexo-border bg-white p-6">
                  {canManage ? (
                    <LetterheadForm letterhead={letterhead} logoUrl={logoUrl} />
                  ) : (
                    <p className="text-sm text-nexo-text-secondary">
                      Apenas administradores e sócios podem editar o timbrado.
                    </p>
                  )}
                </section>
              ),
            },
            {
              key: "conta",
              label: "Minha conta",
              content: (
                <section className="rounded-nexo-card border border-nexo-border bg-white p-6">
                  <p className="mb-4 text-xs text-nexo-text-secondary">{context.email}</p>
                  <UpdateNameForm fullName={context.fullName} />
                </section>
              ),
            },
            {
              key: "seguranca",
              label: "Segurança",
              content: (
                <div className="space-y-6">
                  <section className="rounded-nexo-card border border-nexo-border bg-white p-6">
                    <h2 className="text-sm font-semibold uppercase tracking-wide text-nexo-text-secondary">Alterar senha</h2>
                    <div className="mt-4">
                      <ChangePasswordForm />
                    </div>
                  </section>
                  <section className="rounded-nexo-card border border-nexo-border bg-white p-6">
                    <h2 className="text-sm font-semibold uppercase tracking-wide text-nexo-text-secondary">Sessões</h2>
                    <p className="mt-1 mb-4 text-sm text-nexo-text-secondary">
                      Encerra o acesso em todos os outros dispositivos e navegadores, mantendo esta sessão ativa.
                    </p>
                    <EndOtherSessionsButton />
                  </section>
                </div>
              ),
            },
            {
              key: "preferencias",
              label: "Preferências",
              content: (
                <section className="rounded-nexo-card border border-nexo-border bg-white p-6">
                  <TimezoneForm timezone={timezone} />
                  <p className="mt-6 text-xs text-nexo-text-secondary">
                    Preferências de densidade de interface, confirmação antes de excluir e salvamento automático serão
                    adicionadas junto do editor jurídico e da execução automática da IA, quando essas funções
                    existirem para configurar.
                  </p>
                </section>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}
