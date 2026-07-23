"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { loginSchema, forgotPasswordSchema, resetPasswordSchema } from "@/lib/validation/auth";
import { logAuditEvent } from "@/lib/audit/log";

export type ActionState = { error: string | null; success?: boolean };

const GENERIC_LOGIN_ERROR = "E-mail ou senha inválidos.";

async function signIn(formData: FormData, expectedScope: "master" | "office"): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? GENERIC_LOGIN_ERROR };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error || !data.user) {
    await logAuditEvent({
      eventType: "login_failed",
      metadata: { email: parsed.data.email, scope: expectedScope },
    });
    return { error: GENERIC_LOGIN_ERROR };
  }

  const { data: profile } = await supabase
    .from("users")
    .select("id, account_scope, is_active")
    .eq("id", data.user.id)
    .maybeSingle();

  if (!profile || !profile.is_active || profile.account_scope !== expectedScope) {
    await supabase.auth.signOut();
    await logAuditEvent({
      actorId: data.user.id,
      eventType: "login_denied_wrong_scope",
      metadata: { email: parsed.data.email, expectedScope },
    });
    return {
      error:
        expectedScope === "master"
          ? "Esta conta não tem acesso à administração da plataforma."
          : "Esta conta não tem acesso ao painel do escritório.",
    };
  }

  if (expectedScope === "office") {
    const { data: membership } = await supabase
      .from("memberships")
      .select("tenant_id")
      .eq("user_id", profile.id)
      .eq("status", "active")
      .limit(1)
      .maybeSingle();

    if (!membership) {
      await supabase.auth.signOut();
      return { error: "Este usuário não está vinculado a nenhum escritório ativo." };
    }

    const { data: tenant } = await supabase
      .from("tenants")
      .select("status")
      .eq("id", membership.tenant_id)
      .maybeSingle();

    if (tenant?.status === "blocked") {
      await supabase.auth.signOut();
      await logAuditEvent({
        tenantId: membership.tenant_id,
        actorId: profile.id,
        actorScope: "office",
        eventType: "login_denied_office_blocked",
      });
      return {
        error:
          "O acesso deste escritório está temporariamente bloqueado. Entre em contato com a administração do NEXO Jurídico.",
      };
    }
  }

  await logAuditEvent({
    actorId: profile.id,
    actorScope: profile.account_scope,
    eventType: "login_success",
  });

  redirect(expectedScope === "master" ? "/master" : "/painel");
}

export async function signInOfficeAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  return signIn(formData, "office");
}

export async function signInMasterAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  return signIn(formData, "master");
}

export async function signOutAction() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  await supabase.auth.signOut();
  if (user) {
    await logAuditEvent({ actorId: user.id, eventType: "logout" });
  }
  redirect("/login");
}

export async function requestPasswordResetAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = forgotPasswordSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "E-mail inválido." };
  }

  const supabase = await createClient();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${appUrl}/auth/confirm?next=/redefinir-senha`,
  });

  // Always respond with success to avoid leaking which e-mails have accounts.
  return { error: null, success: true };
}

export async function updatePasswordAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = resetPasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Não foi possível redefinir a senha." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Este link expirou. Solicite a redefinição de senha novamente." };
  }

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) {
    return { error: "Não foi possível salvar a nova senha. Tente novamente." };
  }

  await logAuditEvent({ actorId: user.id, eventType: "password_reset_completed" });

  redirect("/login");
}
