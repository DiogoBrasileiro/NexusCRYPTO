import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { AccountScope } from "@/lib/types/database";

export type AuditEventInput = {
  tenantId?: string | null;
  actorId?: string | null;
  actorScope?: AccountScope | null;
  eventType: string;
  entityType?: string | null;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
};

/**
 * Writes an audit trail entry. Uses the service-role client because audit
 * events can happen before a tenant/session context exists (e.g. a failed
 * login) — RLS on audit_logs otherwise requires an established membership.
 */
export async function logAuditEvent(input: AuditEventInput) {
  const admin = createAdminClient();
  const { error } = await admin.rpc("log_audit_event", {
    p_tenant_id: input.tenantId ?? null,
    p_actor_id: input.actorId ?? null,
    p_actor_scope: input.actorScope ?? null,
    p_event_type: input.eventType,
    p_entity_type: input.entityType ?? null,
    p_entity_id: input.entityId ?? null,
    p_metadata: input.metadata ?? {},
  });

  if (error) {
    console.error("Falha ao registrar auditoria:", error.message);
  }
}
