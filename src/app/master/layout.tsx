import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { MasterSidebar } from "@/components/master/MasterSidebar";
import { signOutMasterAction } from "@/lib/actions/auth";

export default async function MasterLayout({ children }: { children: ReactNode }) {
  const user = await getSessionUser();

  // Defense in depth: proxy.ts already gates /master by account_scope, but a
  // Server Component must never assume the request reached it legitimately.
  if (!user || user.accountScope !== "master") {
    redirect("/master/login");
  }

  return (
    <div className="flex min-h-screen bg-nexo-black text-white">
      <MasterSidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-white/10 px-6">
          <span className="rounded-nexo-pill border border-nexo-lime/30 bg-nexo-lime/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-nexo-lime">
            Ambiente Master
          </span>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm text-white/50 hover:text-white">
              Ver site
            </Link>
            <span className="text-sm text-white/70">{user.fullName}</span>
            <form action={signOutMasterAction}>
              <button
                type="submit"
                className="rounded-nexo-pill border border-white/15 px-3.5 py-1.5 text-xs font-medium text-white/70 hover:bg-white/5"
              >
                Sair
              </button>
            </form>
          </div>
        </header>

        <main className="flex-1 px-6 py-8">{children}</main>
      </div>
    </div>
  );
}
