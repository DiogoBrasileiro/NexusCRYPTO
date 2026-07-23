"use client";

import { useState, useTransition } from "react";
import {
  updateMemberRoleAction,
  toggleMemberActiveAction,
  removeMemberAction,
  resendMemberInviteAction,
} from "@/lib/actions/team";
import { ROLE_LABELS, ROLE_OPTIONS } from "@/lib/domain/roles";
import type { MembershipRole } from "@/lib/types/database";
import { formatDateTime } from "@/lib/utils/format";

export type TeamMember = {
  membershipId: string;
  userId: string;
  role: MembershipRole;
  fullName: string;
  email: string;
  oabNumber: string | null;
  isActive: boolean;
  activeCases: number;
  lastAccessAt: string | null;
};

export function TeamMemberRow({
  member,
  isSelf,
  canManage,
}: {
  member: TeamMember;
  isSelf: boolean;
  canManage: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [resent, setResent] = useState(false);

  return (
    <tr className="hover:bg-nexo-panel-bg">
      <td className="px-4 py-3">
        <p className="font-medium text-nexo-text">{member.fullName}</p>
        <p className="text-xs text-nexo-text-secondary">{member.email}</p>
      </td>
      <td className="px-4 py-3 text-nexo-text-secondary">{member.oabNumber ?? "—"}</td>
      <td className="px-4 py-3">
        {!canManage ? (
          <span className="text-nexo-text-secondary">{ROLE_LABELS[member.role]}</span>
        ) : (
        <select
          defaultValue={member.role}
          disabled={isPending}
          onChange={(e) => {
            setError(null);
            startTransition(async () => {
              try {
                await updateMemberRoleAction(member.membershipId, e.target.value as MembershipRole);
              } catch (err) {
                setError(err instanceof Error ? err.message : "Falha ao alterar.");
              }
            });
          }}
          className="h-9 rounded-nexo-field border border-nexo-border bg-white px-2.5 text-sm focus:border-nexo-lime-dark focus:outline-none"
        >
          {ROLE_OPTIONS.map((role) => (
            <option key={role} value={role}>
              {ROLE_LABELS[role]}
            </option>
          ))}
        </select>
        )}
      </td>
      <td className="px-4 py-3">
        <span
          className={`rounded-nexo-pill px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${
            member.isActive ? "bg-nexo-success/15 text-nexo-success" : "bg-nexo-text-secondary/10 text-nexo-text-secondary"
          }`}
        >
          {member.isActive ? "Ativo" : "Inativo"}
        </span>
      </td>
      <td className="px-4 py-3 text-nexo-text-secondary">{member.activeCases}</td>
      <td className="px-4 py-3 text-nexo-text-secondary">{formatDateTime(member.lastAccessAt)}</td>
      <td className="px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          {!member.lastAccessAt && canManage && (
            <button
              type="button"
              disabled={isPending || resent}
              onClick={() => {
                setError(null);
                startTransition(async () => {
                  try {
                    await resendMemberInviteAction(member.email);
                    setResent(true);
                  } catch {
                    setError("Falha ao reenviar.");
                  }
                });
              }}
              className="text-xs font-medium text-nexo-text hover:underline disabled:opacity-50"
            >
              {resent ? "Convite reenviado" : "Reenviar convite"}
            </button>
          )}
          {!isSelf && canManage && (
            <>
              <button
                type="button"
                disabled={isPending}
                onClick={() => {
                  setError(null);
                  startTransition(async () => {
                    try {
                      await toggleMemberActiveAction(member.userId, !member.isActive);
                    } catch (err) {
                      setError(err instanceof Error ? err.message : "Falha ao atualizar.");
                    }
                  });
                }}
                className="text-xs font-medium text-nexo-text hover:underline disabled:opacity-50"
              >
                {member.isActive ? "Desativar" : "Ativar"}
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={() => {
                  if (!window.confirm(`Remover ${member.fullName} da equipe?`)) return;
                  setError(null);
                  startTransition(async () => {
                    try {
                      await removeMemberAction(member.membershipId, member.userId);
                    } catch (err) {
                      setError(err instanceof Error ? err.message : "Falha ao remover.");
                    }
                  });
                }}
                className="text-xs font-medium text-nexo-error hover:underline disabled:opacity-50"
              >
                Remover
              </button>
            </>
          )}
        </div>
        {error && <p className="mt-1 text-xs font-medium text-nexo-error">{error}</p>}
      </td>
    </tr>
  );
}
