import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getOfficeDetail } from "@/lib/data/master";
import { EditOfficeForm } from "@/components/master/EditOfficeForm";

export const metadata: Metadata = { title: "Editar escritório — Master — NEXO Jurídico" };

export default async function EditOfficePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const detail = await getOfficeDetail(id);
  if (!detail) notFound();

  return (
    <div className="mx-auto max-w-[820px]">
      <Link href={`/master/escritorios/${id}`} className="text-sm text-white/50 hover:text-white">
        ← {detail.profile.name}
      </Link>
      <h1 className="mt-3 text-2xl font-bold text-white">Editar escritório</h1>

      <div className="mt-8 rounded-nexo-card border border-white/10 bg-white/[0.03] p-6 sm:p-8">
        <EditOfficeForm tenant={detail.tenant} profile={detail.profile} />
      </div>
    </div>
  );
}
