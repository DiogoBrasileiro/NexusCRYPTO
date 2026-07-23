"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOutAction } from "@/lib/actions/auth";
import { cn } from "@/lib/utils/cn";

const NAV_LINKS = [
  { href: "/painel", label: "Mesa Jurídica" },
  { href: "/casos", label: "Casos" },
  { href: "/clientes", label: "Clientes" },
  { href: "/central-inteligencia", label: "Inteligência" },
];

const MANAGEMENT_LINKS = [
  { href: "/equipe", label: "Equipe" },
  { href: "/configuracoes", label: "Configurações" },
];

export function OfficeHeader({ fullName, officeName }: { fullName: string; officeName: string }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [gestaoOpen, setGestaoOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();

  const initials = fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <div className="sticky top-0 z-40">
      <header className="flex h-14 items-center justify-between bg-nexo-black px-4 sm:px-6">
        <div className="flex items-center gap-8">
          <Link href="/painel" className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-nexo-lime text-xs font-bold text-nexo-black">
              N
            </span>
            <span className="text-sm font-bold text-white">Nexo</span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {NAV_LINKS.map((link) => {
              const active = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "rounded-nexo-field px-3 py-1.5 text-sm font-medium transition-colors",
                    active ? "bg-white/10 text-white" : "text-white/60 hover:text-white",
                  )}
                >
                  {link.label}
                </Link>
              );
            })}

            <div className="relative">
              <button
                type="button"
                onClick={() => setGestaoOpen((v) => !v)}
                onBlur={() => setTimeout(() => setGestaoOpen(false), 150)}
                className={cn(
                  "flex items-center gap-1 rounded-nexo-field px-3 py-1.5 text-sm font-medium transition-colors",
                  MANAGEMENT_LINKS.some((l) => pathname.startsWith(l.href))
                    ? "bg-white/10 text-white"
                    : "text-white/60 hover:text-white",
                )}
              >
                Gestão
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {gestaoOpen && (
                <div className="absolute left-0 top-full mt-1 w-44 rounded-nexo-field border border-white/10 bg-nexo-black-secondary p-1.5 shadow-xl">
                  {MANAGEMENT_LINKS.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="block rounded-nexo-field px-3 py-2 text-sm text-white/80 hover:bg-white/5"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative hidden sm:block">
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              onBlur={() => setTimeout(() => setMenuOpen(false), 150)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-xs font-semibold text-white"
            >
              {initials || "U"}
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-2 w-52 rounded-nexo-field border border-white/10 bg-nexo-black-secondary p-1.5 shadow-xl">
                <div className="px-3 py-2">
                  <p className="truncate text-sm font-medium text-white">{fullName}</p>
                  <p className="truncate text-xs text-white/40">{officeName}</p>
                </div>
                <div className="my-1 border-t border-white/10" />
                <form action={signOutAction}>
                  <button type="submit" className="w-full rounded-nexo-field px-3 py-2 text-left text-sm text-white/80 hover:bg-white/5">
                    Sair
                  </button>
                </form>
              </div>
            )}
          </div>

          <button
            type="button"
            aria-label="Abrir menu"
            onClick={() => setMobileOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-nexo-field text-white lg:hidden"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </header>

      {mobileOpen && (
        <div className="border-t border-white/10 bg-nexo-black px-4 py-3 lg:hidden">
          <nav className="flex flex-col gap-1">
            {[...NAV_LINKS, ...MANAGEMENT_LINKS].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-nexo-field px-3 py-2.5 text-sm text-white/80 hover:bg-white/5"
              >
                {link.label}
              </Link>
            ))}
            <form action={signOutAction}>
              <button type="submit" className="w-full rounded-nexo-field px-3 py-2.5 text-left text-sm text-white/60 hover:bg-white/5">
                Sair
              </button>
            </form>
          </nav>
        </div>
      )}

      <div className="flex h-14 items-center gap-3 border-b border-nexo-border bg-white px-4 sm:px-6">
        <form
          className="relative max-w-md flex-1"
          onSubmit={(e) => {
            e.preventDefault();
            const value = new FormData(e.currentTarget).get("q");
            if (typeof value === "string" && value.trim()) {
              router.push(`/casos?busca=${encodeURIComponent(value.trim())}`);
            }
          }}
        >
          <input
            type="search"
            name="q"
            placeholder="Buscar caso, cliente, parte ou processo..."
            className="h-10 w-full rounded-nexo-field border border-nexo-border bg-nexo-panel-bg px-3.5 text-sm text-nexo-text placeholder:text-nexo-text-secondary focus:border-nexo-lime-dark focus:outline-none"
          />
        </form>

        <Link
          href="/painel#alertas"
          aria-label="Notificações"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-nexo-text-secondary hover:bg-nexo-panel-bg"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M13.73 21a2 2 0 01-3.46 0" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>

        <Link
          href="/casos/novo"
          className="flex h-10 shrink-0 items-center gap-1.5 rounded-nexo-pill bg-nexo-lime px-4 text-sm font-semibold text-nexo-black hover:bg-nexo-lime-dark"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 5v14M5 12h14" strokeLinecap="round" />
          </svg>
          Novo caso
        </Link>
      </div>
    </div>
  );
}
