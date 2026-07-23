"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionUser } from "@/lib/auth/session";
import { logAuditEvent } from "@/lib/audit/log";
import { aiSettingsSchema } from "@/lib/validation/master";
import { encryptSecret, decryptSecret } from "@/lib/security/crypto";
import type { GlobalAiSettingsRow } from "@/lib/types/database";

export type AiSettingsActionState = { error: string | null; success?: boolean };

async function requireMaster() {
  const user = await getSessionUser();
  if (!user || user.accountScope !== "master") {
    throw new Error("NOT_AUTHORIZED");
  }
  return user;
}

export async function saveAiSettingsAction(
  _prevState: AiSettingsActionState,
  formData: FormData,
): Promise<AiSettingsActionState> {
  const master = await requireMaster();

  const parsed = aiSettingsSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }
  const input = parsed.data;
  const isActive = formData.get("isActive") === "on";

  const update: Partial<GlobalAiSettingsRow> = {
    provider: input.provider,
    model: input.model,
    is_active: isActive,
    max_output_tokens: input.maxOutputTokens,
    timeout_seconds: input.timeoutSeconds,
    max_retries: input.maxRetries,
    global_monthly_execution_limit: input.globalMonthlyLimit,
    default_office_monthly_limit: input.defaultOfficeMonthlyLimit,
    updated_by: master.id,
  };

  if (input.apiKey) {
    try {
      update.api_key_ciphertext = encryptSecret(input.apiKey);
      update.api_key_last_four = input.apiKey.slice(-4);
    } catch (err) {
      return { error: err instanceof Error ? err.message : "Não foi possível cifrar a credencial." };
    }
  }

  const admin = createAdminClient();
  const { error } = await admin.from("global_ai_settings").update(update).eq("id", true);
  if (error) {
    return { error: "Não foi possível salvar a configuração de IA." };
  }

  await logAuditEvent({
    actorId: master.id,
    actorScope: "master",
    eventType: "ai_settings_updated",
    entityType: "global_ai_settings",
    metadata: { provider: input.provider, model: input.model, isActive, keyRotated: Boolean(input.apiKey) },
  });

  revalidatePath("/master/configuracao-ia");
  return { error: null, success: true };
}

export type ProviderTestResult = { ok: boolean; message: string };

type CredentialLoadResult =
  | { ok: true; provider: string; model: string; apiKey: string }
  | { ok: false; message: string };

async function loadDecryptedCredential(): Promise<CredentialLoadResult> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("global_ai_settings")
    .select("provider, model, api_key_ciphertext")
    .eq("id", true)
    .maybeSingle();

  if (!data?.api_key_ciphertext) {
    return { ok: false, message: "Nenhuma credencial salva ainda. Salve uma chave de API antes de testar." };
  }

  try {
    const apiKey = decryptSecret(data.api_key_ciphertext);
    return { ok: true, provider: data.provider, model: data.model, apiKey };
  } catch {
    return { ok: false, message: "Não foi possível ler a credencial salva. Salve a chave novamente." };
  }
}

export async function testAiCredentialAction(): Promise<ProviderTestResult> {
  const master = await requireMaster();
  const loaded = await loadDecryptedCredential();
  if (!loaded.ok) return loaded;

  if (loaded.provider !== "anthropic") {
    return { ok: false, message: `Teste automático ainda não implementado para o provedor "${loaded.provider}".` };
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/models", {
      headers: { "x-api-key": loaded.apiKey, "anthropic-version": "2023-06-01" },
    });

    const ok = response.ok;
    await logAuditEvent({
      actorId: master.id,
      actorScope: "master",
      eventType: "ai_credential_tested",
      entityType: "global_ai_settings",
      metadata: { ok, status: response.status },
    });

    if (ok) return { ok: true, message: "Credencial válida. A conexão com o provedor foi confirmada." };
    if (response.status === 401) return { ok: false, message: "Credencial inválida, expirada ou revogada." };
    return { ok: false, message: `O provedor retornou status ${response.status}.` };
  } catch {
    return { ok: false, message: "Não foi possível conectar ao provedor de IA. Verifique a rede do servidor." };
  }
}

export async function testAiModelAction(): Promise<ProviderTestResult> {
  const master = await requireMaster();
  const loaded = await loadDecryptedCredential();
  if (!loaded.ok) return loaded;

  if (loaded.provider !== "anthropic") {
    return { ok: false, message: `Teste automático ainda não implementado para o provedor "${loaded.provider}".` };
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": loaded.apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: loaded.model,
        max_tokens: 1,
        messages: [{ role: "user", content: "ping" }],
      }),
    });

    const ok = response.ok;
    await logAuditEvent({
      actorId: master.id,
      actorScope: "master",
      eventType: "ai_model_tested",
      entityType: "global_ai_settings",
      metadata: { ok, status: response.status, model: loaded.model },
    });

    if (ok) return { ok: true, message: `O modelo "${loaded.model}" respondeu com sucesso.` };

    const body = (await response.json().catch(() => null)) as { error?: { message?: string } } | null;
    return { ok: false, message: body?.error?.message ?? `O provedor retornou status ${response.status}.` };
  } catch {
    return { ok: false, message: "Não foi possível conectar ao provedor de IA. Verifique a rede do servidor." };
  }
}
