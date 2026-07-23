import type { ReactNode } from "react";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { Footer } from "@/components/landing/Footer";

export function LegalPageLayout({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-nexo-black">
      <LandingHeader />
      <main className="flex-1 px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-[760px]">
          <h1 className="text-3xl font-bold text-white">{title}</h1>
          <div className="prose-invert mt-8 space-y-5 text-sm leading-relaxed text-white/70 [&_h2]:mt-8 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-white [&_strong]:text-white">
            {children}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
