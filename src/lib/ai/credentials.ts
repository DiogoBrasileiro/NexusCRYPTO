import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { decryptSecret } from "@/lib/security/crypto";

export type AiCredential = {
  provider: string;
  model: string;
  apiKey: string;
  maxOutputTokens: number;
  timeoutSeconds: number;
  maxRetries: number;
};

export type AiCredentialResult = { ok: true; credential: AiCredential } | { ok: false; error: string };

/**
 * Loads and decrypts the single global AI credential (MVP: one active
 * provider/model for the whole platform, per §30). Office sessions have no
 * RLS access to global_ai_settings, so this always goes through the
 * service-role client — the same trust boundary as the Master "testar
 * credencial" actions.
 */
export async function loadActiveAiCredential(): Promise<AiCredentialResult> {
  const admin = createAdminClient();
  const { data } = await admin.from("global_ai_settings").select("*").eq("id", true).maybeSingle();

  if (!data || !data.is_active) {
    return { ok: false, error: "A IA global não está ativa. Contate a administração da plataforma." };
  }
  if (!data.api_key_ciphertext) {
    return { ok: false, error: "Nenhuma credencial de IA configurada." };
  }

  try {
    const apiKey = decryptSecret(data.api_key_ciphertext);
    return {
      ok: true,
      credential: {
        provider: data.provider,
        model: data.model,
        apiKey,
        maxOutputTokens: data.max_output_tokens,
        timeoutSeconds: data.timeout_seconds,
        maxRetries: data.max_retries,
      },
    };
  } catch {
    return { ok: false, error: "Não foi possível ler a credencial de IA salva." };
  }
}
