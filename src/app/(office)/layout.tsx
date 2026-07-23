import type { ReactNode } from "react";
import { requireOfficeContext } from "@/lib/auth/office-context";
import { OfficeHeader } from "@/components/office/OfficeHeader";

export default async function OfficeLayout({ children }: { children: ReactNode }) {
  const context = await requireOfficeContext();

  return (
    <div className="flex min-h-screen flex-col bg-nexo-panel-bg">
      <OfficeHeader fullName={context.fullName} officeName={context.officeName} />
      <main className="mx-auto w-full max-w-[1180px] flex-1 px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
