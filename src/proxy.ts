import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const MASTER_LOGIN = "/master/login";
const OFFICE_LOGIN = "/login";

const PUBLIC_PATHS = ["/", "/como-funciona", "/termos", "/privacidade", "/contato"];

function isPublicPath(pathname: string) {
  if (PUBLIC_PATHS.includes(pathname)) return true;
  return pathname.startsWith("/_next") || pathname.startsWith("/api/public");
}

/**
 * Runs on every request (Next.js 16: middleware.ts was renamed to proxy.ts).
 * Responsibilities: (1) refresh the Supabase session cookie, (2) keep master
 * and office areas segregated by account_scope, (3) bounce unauthenticated
 * requests to the right login screen. tenant_id itself is never read or
 * trusted here — that only ever happens server-side against the session.
 */
export async function proxy(request: NextRequest) {
  const response = NextResponse.next({ request });
  const { pathname } = request.nextUrl;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    // Environment not provisioned yet (e.g. local dev without Supabase set
    // up). Let public routes render instead of hard-crashing every request;
    // protected routes still redirect to login since there is no session.
    if (isPublicPath(pathname)) return response;
    if (pathname.startsWith("/master") && pathname !== MASTER_LOGIN) {
      return NextResponse.redirect(new URL(MASTER_LOGIN, request.url));
    }
    if (isProtectedOfficePath(pathname)) {
      return NextResponse.redirect(new URL(OFFICE_LOGIN, request.url));
    }
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let accountScope: "master" | "office" | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from("users")
      .select("account_scope, is_active")
      .eq("id", user.id)
      .maybeSingle();
    if (profile?.is_active) accountScope = profile.account_scope;
  }

  const isMasterArea = pathname.startsWith("/master");
  const isOfficeArea = isProtectedOfficePath(pathname);

  if (pathname === MASTER_LOGIN) {
    if (accountScope === "master") return NextResponse.redirect(new URL("/master", request.url));
    return response;
  }

  if (pathname === OFFICE_LOGIN) {
    if (accountScope === "office") return NextResponse.redirect(new URL("/painel", request.url));
    return response;
  }

  if (isMasterArea) {
    if (accountScope !== "master") {
      return NextResponse.redirect(new URL(MASTER_LOGIN, request.url));
    }
    return response;
  }

  if (isOfficeArea) {
    if (accountScope !== "office") {
      return NextResponse.redirect(new URL(OFFICE_LOGIN, request.url));
    }
    return response;
  }

  return response;
}

function isProtectedOfficePath(pathname: string) {
  return (
    pathname.startsWith("/painel") ||
    pathname.startsWith("/casos") ||
    pathname.startsWith("/clientes") ||
    pathname.startsWith("/central-inteligencia") ||
    pathname.startsWith("/equipe") ||
    pathname.startsWith("/configuracoes")
  );
}

export const config = {
  matcher: [
    /*
     * Run on everything except static assets and Next internals.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
