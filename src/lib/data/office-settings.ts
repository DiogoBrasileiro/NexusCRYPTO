import "server-only";
import { createClient } from "@/lib/supabase/server";

export async function getOfficeProfile(tenantId: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("office_profiles").select("*").eq("tenant_id", tenantId).maybeSingle();
  return data;
}

export async function getLetterheadSettings(tenantId: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("letterhead_settings").select("*").eq("tenant_id", tenantId).maybeSingle();
  return data;
}

export async function getSignedLogoUrl(path: string | null | undefined) {
  if (!path) return null;
  const supabase = await createClient();
  const { data } = await supabase.storage.from("office-assets").createSignedUrl(path, 3600);
  return data?.signedUrl ?? null;
}

export async function getUserTimezone(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("users").select("timezone").eq("id", userId).maybeSingle();
  return data?.timezone ?? "America/Sao_Paulo";
}
