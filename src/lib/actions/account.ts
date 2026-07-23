"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth/session";
import { changePasswordSchema } from "@/lib/validation/auth";
import { logAuditEvent } from "@/lib/audit/log";

export type AccountActionState = { error: string | null; success?: boolean };

export async function updateProfileNameAction(
  _prevState: AccountActionState,
  formData: FormData,
): Promise<AccountActionState> {
  const user = await getSessionUser();
  if (!user) return { error: "Sessão expirada. Entre novamente." };

  const fullName = String(formData.get("fullName") ?? "").trim();
  if (fullName.length < 2) return { error: "Informe um nome válido." };

  const supabase = await createClient();
  const { error } = await supabase.from("users").update({ full_name: fullName }).eq("id", user.id);
  if (error) return { error: "Não foi possível salvar o nome." };

  revalidatePath(user.accountScope === "master" ? "/master/configuracoes" : "/configuracoes");
  return { error: null, success: true };
}

export async function changePasswordAction(
  _prevState: AccountActionState,
  formData: FormData,
): Promise<AccountActionState> {
  const user = await getSessionUser();
  if (!user) return { error: "Sessão expirada. Entre novamente." };

  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const supabase = await createClient();

  // Supabase has no standalone "verify current password" call — re-authenticating
  // with it is the supported way to confirm it before rotating to the new one.
  const { error: reauthError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: parsed.data.currentPassword,
  });
  if (reauthError) return { error: "Senha atual incorreta." };

  const { error } = await supabase.auth.updateUser({ password: parsed.data.newPassword });
  if (error) return { error: "Não foi possível alterar a senha." };

  await logAuditEvent({ actorId: user.id, actorScope: user.accountScope, eventType: "password_changed" });
  return { error: null, success: true };
}
