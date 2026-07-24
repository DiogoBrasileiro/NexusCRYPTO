// Only ever redirect to a same-origin relative path — a `next` query
// param is fully attacker-controlled (they can craft a link with a
// valid-looking token but an arbitrary `next`), so treating it as a
// trusted redirect target would be an open redirect (CWE-601).
export function safeNextPath(next: string | null | undefined): string {
  if (!next) return "/";
  if (!next.startsWith("/") || next.startsWith("//") || next.includes("://") || next.includes("\\")) {
    return "/";
  }
  return next;
}
