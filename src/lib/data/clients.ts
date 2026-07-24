import "server-only";
import { createClient } from "@/lib/supabase/server";

const PAGE_SIZE = 30;

// Strips characters that have special meaning in PostgREST's filter DSL
// (used inside .or()) so a search term can never be interpreted as
// additional filter syntax. This can't cross the tenant_id boundary either
// way (that's a separate, non-interpolated .eq() call), but user input
// reaching a filter-string builder unescaped is bad practice regardless.
function sanitizeSearchTerm(term: string): string {
  return term.replace(/[,()]/g, " ").trim();
}

export async function listClients(tenantId: string, search?: string, page = 1) {
  const supabase = await createClient();
  const currentPage = page > 0 ? page : 1;
  const from = (currentPage - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from("clients")
    .select("id, kind, full_name, company_name, cpf, cnpj, email, phone, updated_at", { count: "exact" })
    .eq("tenant_id", tenantId)
    .is("archived_at", null)
    .order("updated_at", { ascending: false })
    .range(from, to);

  const term = sanitizeSearchTerm(search ?? "");
  if (term) {
    const pattern = `%${term}%`;
    query = query.or(
      `full_name.ilike.${pattern},company_name.ilike.${pattern},email.ilike.${pattern},cpf.ilike.${pattern},cnpj.ilike.${pattern}`,
    );
  }

  const { data, error, count } = await query;
  if (error) throw new Error(`Falha ao carregar clientes: ${error.message}`);

  return { clients: data ?? [], total: count ?? 0, page: currentPage, pageSize: PAGE_SIZE };
}

// For <select> pickers (e.g. the case creation form), not the paginated
// list view — needs every active client, not just the first page.
export async function listClientOptions(tenantId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("clients")
    .select("id, full_name, company_name")
    .eq("tenant_id", tenantId)
    .is("archived_at", null)
    .order("full_name", { ascending: true })
    .limit(500);
  return (data ?? []).map((c) => ({ id: c.id, label: c.full_name ?? c.company_name ?? "Cliente" }));
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
    .order("updated_at", { ascending: false })
    .limit(100);

  return { client, cases: cases ?? [] };
}
