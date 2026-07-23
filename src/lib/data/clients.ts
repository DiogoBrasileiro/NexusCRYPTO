import "server-only";
import { createClient } from "@/lib/supabase/server";

export async function listClients(tenantId: string, search?: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clients")
    .select("id, kind, full_name, company_name, cpf, cnpj, email, phone, updated_at")
    .eq("tenant_id", tenantId)
    .is("archived_at", null)
    .order("updated_at", { ascending: false });
  if (error) throw new Error(`Falha ao carregar clientes: ${error.message}`);

  const clients = data ?? [];
  if (!search) return clients;

  const q = search.trim().toLowerCase();
  if (!q) return clients;

  return clients.filter((c) => {
    const haystack = `${c.full_name ?? ""} ${c.company_name ?? ""} ${c.cpf ?? ""} ${c.cnpj ?? ""} ${c.email ?? ""}`.toLowerCase();
    return haystack.includes(q);
  });
}

export async function getClient(tenantId: string, clientId: string) {
  const supabase = await createClient();
  const { data: client } = await supabase
    .from("clients")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("id", clientId)
    .maybeSingle();

  if (!client) return null;

  const { data: cases } = await supabase
    .from("cases")
    .select("id, code, title, status, updated_at")
    .eq("tenant_id", tenantId)
    .eq("client_id", clientId)
    .order("updated_at", { ascending: false });

  return { client, cases: cases ?? [] };
}
