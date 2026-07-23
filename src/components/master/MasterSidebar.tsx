"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";

const NAV_ITEMS = [
  { href: "/master", label: "Visão Geral", exact: true },
  { href: "/master/escritorios", label: "Escritórios" },
  { href: "/master/configuracao-ia", label: "Configuração da IA" },
  { href: "/master/auditoria", label: "Auditoria" },
  { href: "/master/configuracoes", label: "Configurações" },
];

export function MasterSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 border-r border-white/10 bg-nexo-black-secondary px-4 py-6 lg:flex lg:flex-col">
      <Link href="/master" className="flex items-center gap-2 px-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-nexo-lime text-sm font-bold text-nexo-black">
          N
        </span>
        <span className="text-base font-bold text-white">Nexo</span>
      </Link>

      <nav className="mt-8 flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-nexo-field px-3 py-2.5 text-sm font-medium transition-colors",
                isActive ? "bg-nexo-lime text-nexo-black" : "text-white/60 hover:bg-white/5 hover:text-white",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
