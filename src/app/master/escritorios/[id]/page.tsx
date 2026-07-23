import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getOfficeDetail } from "@/lib/data/master";
import { OfficeStatusBadge } from "@/components/master/OfficeStatusBadge";
import { OfficeStatusActions } from "@/components/master/OfficeStatusActions";
import { ResendInvitationButton } from "@/components/master/ResendInvitationButton";
import { formatDate, formatDateTime } from "@/lib/utils/format";

export const metadata: Metadata = { title: "Escritório — Master — NEXO Jurídico" };

const ROLE_LABELS: Record<string, string> = {
  administrador: "Administrador",
  socio: "Sócio",
  advogado: "Advogado",
  revisor: "Revisor",
  assistente: "Assistente",
  estagiario: "Estagiário",
  somente_leitura: "Somente leitura",
};

export default async function OfficeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const detail = await getOfficeDetail(id);
  if (!detail) notFound();

  const { tenant, profile, members, invitations, recentAudit } = detail;
  const pendingInvitations = invitations.filter((inv) => inv.status === "pending");

  return (
    <div className="mx-auto max-w-[1000px]">
      <Link href="/master/escritorios" className="text-sm text-white/50 hover:text-white">
        ← Escritórios
      </Link>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">{profile.name}</h1>
            <OfficeStatusBadge status={tenant.status} />
          </div>
          <p className="mt-1 text-sm text-white/50">
            Responsável: {profile.responsible_name} · {profile.responsible_email}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/master/escritorios/${id}/editar`}
            className="rounded-nexo-pill border border-white/15 px-4 py-2 text-sm font-medium text-white hover:bg-white/5"
          >
            Editar
          </Link>
          <OfficeStatusActions tenantId={id} status={tenant.status} />
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="rounded-nexo-card border border-white/10 bg-white/[0.03] p-6 lg:col-span-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-white/40">Dados do escritório</h2>
          <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
            <Field label="Razão social" value={profile.legal_name} />
            <Field label="CNPJ" value={profile.cnpj} />
            <Field label="Telefone" value={profile.phone} />
            <Field label="Cidade / UF" value={[profile.city, profile.state].filter(Boolean).join(" / ") || null} />
            <Field label="Criado em" value={formatDate(tenant.created_at)} />
            <Field label="Limite de usuários" value={String(profile.user_limit)} />
            <Field label="Limite mensal de IA" value={String(tenant.ai_monthly_execution_limit)} />
          </dl>
        </section>

        <section className="rounded-nexo-card border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-white/40">Convites pendentes</h2>
          {pendingInvitations.length === 0 ? (
            <p className="mt-4 text-sm text-white/40">Nenhum convite pendente.</p>
          ) : (
            <ul className="mt-4 space-y-4">
              {pendingInvitations.map((inv) => (
                <li key={inv.id}>
                  <p className="text-sm text-white">{inv.email}</p>
                  <p className="text-xs text-white/40">
                    {ROLE_LABELS[inv.role] ?? inv.role} · expira em {formatDate(inv.expires_at)}
                  </p>
                  <div className="mt-2">
                    <ResendInvitationButton tenantId={id} email={inv.email} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="mt-6 rounded-nexo-card border border-white/10 bg-white/[0.03] p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-white/40">Usuários ({members.length})</h2>
        {members.length === 0 ? (
          <p className="mt-4 text-sm text-white/40">Nenhum usuário vinculado ainda.</p>
        ) : (
          <ul className="mt-4 divide-y divide-white/10">
            {members.map((member) => (
              <li key={member.id} className="flex items-center justify-between py-3 text-sm">
                <div>
                  <p className="font-medium text-white">{member.user?.full_name ?? "Usuário pendente"}</p>
                  <p className="text-xs text-white/40">{member.user?.email}</p>
                </div>
                <span className="text-xs font-medium uppercase tracking-wide text-white/50">
                  {ROLE_LABELS[member.role] ?? member.role}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-6 rounded-nexo-card border border-white/10 bg-white/[0.03] p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-white/40">Eventos de auditoria</h2>
        {recentAudit.length === 0 ? (
          <p className="mt-4 text-sm text-white/40">Nenhum evento registrado para este escritório.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {recentAudit.map((event) => (
              <li key={event.id} className="flex items-center justify-between text-sm">
                <span className="text-white/70">{event.event_type}</span>
                <span className="text-xs text-white/40">{formatDateTime(event.created_at)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <dt className="text-xs text-white/40">{label}</dt>
      <dd className="mt-0.5 text-white/80">{value || "—"}</dd>
    </div>
  );
}
