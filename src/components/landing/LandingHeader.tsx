"use client";

import { useState } from "react";
import Link from "next/link";

const NAV_LINKS = [
  { href: "#como-funciona", label: "Como funciona" },
  { href: "#especialistas", label: "Especialistas" },
  { href: "#producoes", label: "Produções" },
  { href: "#seguranca", label: "Segurança" },
];

export function LandingHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-nexo-black/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-nexo-lime text-sm font-bold text-nexo-black">
            N
          </span>
          <span className="text-base font-bold text-white">Nexo Jurídico</span>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} className="text-sm text-white/70 transition-colors hover:text-white">
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link href="/login" className="text-sm font-medium text-white/80 hover:text-white">
            Acessar sistema
          </Link>
          <Link
            href="/login"
            className="inline-flex h-9 items-center justify-center whitespace-nowrap rounded-nexo-pill bg-nexo-lime px-4 text-sm font-semibold text-nexo-black transition-colors hover:bg-nexo-lime-dark"
          >
            Solicitar demonstração
          </Link>
        </div>

        <button
          type="button"
          aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center rounded-nexo-field text-white lg:hidden"
        >
          <span className="sr-only">Menu</span>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {menuOpen ? (
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            ) : (
              <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-white/10 bg-nexo-black px-4 py-4 lg:hidden">
          <nav className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="rounded-nexo-field px-3 py-2.5 text-sm text-white/80 hover:bg-white/5"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="mt-3 flex flex-col gap-2 border-t border-white/10 pt-3">
            <Link
              href="/login"
              className="rounded-nexo-field px-3 py-2.5 text-sm font-medium text-white/80 hover:bg-white/5"
            >
              Acessar sistema
            </Link>
            <Link
              href="/login"
              className="flex h-11 items-center justify-center rounded-nexo-pill bg-nexo-lime text-sm font-semibold text-nexo-black"
            >
              Solicitar demonstração
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
