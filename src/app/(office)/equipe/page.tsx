import type { Metadata } from "next";
import { requireOfficeContext, canManageOffice } from "@/lib/auth/office-context";
import { listTeamMembers, getOfficeUserLimit } from "@/lib/data/team";
import { TeamMemberRow } from "@/components/office/TeamMemberRow";
import { InviteMemberForm } from "@/components/office/InviteMemberForm";

export const metadata: Metadata = { title: "Equipe — NEXO Jurídico" };

export default async function TeamPage() {
  const context = await requireOfficeContext();
  const [members, userLimit] = await Promise.all([
    listTeamMembers(context.tenantId),
    getOfficeUserLimit(context.tenantId),
  ]);
  const canManage = canManageOffice(context.role);

  return (
    <div>
      <h1 className="text-2xl font-bold text-nexo-text">Equipe</h1>
      <p className="mt-1 text-sm text-nexo-text-secondary">
        {members.length} de {userLimit} usuário(s) utilizados.
      </p>

      {canManage && (
        <section className="mt-6 rounded-nexo-card border border-nexo-border bg-white p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-nexo-text-secondary">Novo membro</h2>
          <div className="mt-4">
            <InviteMemberForm />
          </div>
        </section>
      )}

      <div className="mt-6 overflow-x-auto rounded-nexo-card border border-nexo-border bg-white">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead>
            <tr className="border-b border-nexo-border text-xs uppercase tracking-wide text-nexo-text-secondary">
              <th className="px-4 py-3 font-medium">Nome</th>
              <th className="px-4 py-3 font-medium">OAB</th>
              <th className="px-4 py-3 font-medium">Perfil</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Casos ativos</th>
              <th className="px-4 py-3 font-medium">Último acesso</th>
              <th className="px-4 py-3 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-nexo-border">
            {members.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-nexo-text-secondary">
                  Nenhum membro adicional cadastrado.
                </td>
              </tr>
            ) : (
              members.map((member) => (
                <TeamMemberRow
                  key={member.membershipId}
                  member={member}
                  isSelf={member.userId === context.userId}
                  canManage={canManage}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
