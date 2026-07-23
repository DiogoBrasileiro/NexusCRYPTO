"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { FormField, Input } from "@/components/ui/field";
import { updateLetterheadAction, type SettingsActionState } from "@/lib/actions/office-settings";
import type { LetterheadSettingsRow } from "@/lib/types/database";

const initialState: SettingsActionState = { error: null };

export function LetterheadForm({
  letterhead,
  logoUrl,
}: {
  letterhead: LetterheadSettingsRow | null;
  logoUrl: string | null;
}) {
  const [state, formAction, isPending] = useActionState(updateLetterheadAction, initialState);
  const [preview, setPreview] = useState({
    officeName: letterhead?.office_name ?? "",
    lawyerName: letterhead?.lawyer_name ?? "",
    oabNumber: letterhead?.oab_number ?? "",
    address: letterhead?.address ?? "",
    headerText: letterhead?.header_text ?? "",
    footerText: letterhead?.footer_text ?? "",
    brandColor: letterhead?.brand_color ?? "#0b0b0b",
    useLetterhead: letterhead?.use_letterhead ?? true,
  });

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <form action={formAction} className="space-y-4">
        <label className="flex items-center gap-2.5 text-sm text-nexo-text">
          <input
            type="checkbox"
            name="useLetterhead"
            defaultChecked={preview.useLetterhead}
            onChange={(e) => setPreview((p) => ({ ...p, useLetterhead: e.target.checked }))}
            className="h-4 w-4 rounded border-nexo-border accent-nexo-lime-dark"
          />
          Aplicar timbrado aos documentos exportados
        </label>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Nome do escritório" htmlFor="officeName">
            <Input
              id="officeName"
              name="officeName"
              defaultValue={preview.officeName}
              onChange={(e) => setPreview((p) => ({ ...p, officeName: e.target.value }))}
            />
          </FormField>
          <FormField label="Razão social" htmlFor="legalName">
            <Input id="legalName" name="legalName" defaultValue={letterhead?.legal_name ?? ""} />
          </FormField>
          <FormField label="CNPJ" htmlFor="cnpj">
            <Input id="cnpj" name="cnpj" defaultValue={letterhead?.cnpj ?? ""} />
          </FormField>
          <FormField label="Advogado" htmlFor="lawyerName">
            <Input
              id="lawyerName"
              name="lawyerName"
              defaultValue={preview.lawyerName}
              onChange={(e) => setPreview((p) => ({ ...p, lawyerName: e.target.value }))}
            />
          </FormField>
          <FormField label="OAB" htmlFor="oabNumber">
            <Input
              id="oabNumber"
              name="oabNumber"
              defaultValue={preview.oabNumber}
              onChange={(e) => setPreview((p) => ({ ...p, oabNumber: e.target.value }))}
            />
          </FormField>
          <FormField label="Cor institucional" htmlFor="brandColor">
            <input
              id="brandColor"
              name="brandColor"
              type="color"
              defaultValue={preview.brandColor}
              onChange={(e) => setPreview((p) => ({ ...p, brandColor: e.target.value }))}
              className="h-11 w-full rounded-nexo-field border border-nexo-border"
            />
          </FormField>
          <FormField label="Endereço" htmlFor="address">
            <Input
              id="address"
              name="address"
              defaultValue={preview.address}
              onChange={(e) => setPreview((p) => ({ ...p, address: e.target.value }))}
            />
          </FormField>
          <FormField label="Telefone" htmlFor="phone">
            <Input id="phone" name="phone" defaultValue={letterhead?.phone ?? ""} />
          </FormField>
          <FormField label="E-mail" htmlFor="email">
            <Input id="email" name="email" defaultValue={letterhead?.email ?? ""} />
          </FormField>
          <FormField label="Site" htmlFor="website">
            <Input id="website" name="website" defaultValue={letterhead?.website ?? ""} />
          </FormField>
        </div>

        <FormField label="Texto do cabeçalho" htmlFor="headerText">
          <Input
            id="headerText"
            name="headerText"
            defaultValue={preview.headerText}
            onChange={(e) => setPreview((p) => ({ ...p, headerText: e.target.value }))}
          />
        </FormField>
        <FormField label="Texto do rodapé" htmlFor="footerText">
          <Input
            id="footerText"
            name="footerText"
            defaultValue={preview.footerText}
            onChange={(e) => setPreview((p) => ({ ...p, footerText: e.target.value }))}
          />
        </FormField>

        {state.error && <p className="text-sm font-medium text-nexo-error">{state.error}</p>}
        {state.success && <p className="text-sm font-medium text-nexo-success">Timbrado salvo.</p>}
        <Button type="submit" disabled={isPending} size="sm">
          {isPending ? "Salvando..." : "Salvar timbrado"}
        </Button>
      </form>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-nexo-text-secondary">Prévia</p>
        <div className="relative mx-auto aspect-[210/297] w-full max-w-[420px] rounded-lg border border-nexo-border bg-white p-8 text-nexo-text shadow-sm">
          {preview.useLetterhead && (
            <div className="flex items-center gap-3 border-b pb-3" style={{ borderColor: preview.brandColor }}>
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoUrl} alt="" className="h-10 w-10 object-contain" />
              ) : (
                <div className="h-10 w-10 rounded" style={{ backgroundColor: preview.brandColor }} />
              )}
              <div>
                <p className="text-sm font-bold" style={{ color: preview.brandColor }}>
                  {preview.officeName || "Nome do escritório"}
                </p>
                {preview.headerText && <p className="text-[10px] text-nexo-text-secondary">{preview.headerText}</p>}
              </div>
            </div>
          )}

          <div className="mt-6 space-y-2">
            <div className="h-2 w-3/4 rounded bg-nexo-text/10" />
            <div className="h-2 w-full rounded bg-nexo-text/10" />
            <div className="h-2 w-full rounded bg-nexo-text/10" />
            <div className="h-2 w-5/6 rounded bg-nexo-text/10" />
          </div>

          {preview.useLetterhead && (
            <div className="absolute bottom-8 left-8 right-8 border-t pt-2 text-[9px] text-nexo-text-secondary" style={{ borderColor: preview.brandColor }}>
              {preview.lawyerName && <p>{preview.lawyerName}{preview.oabNumber ? ` · OAB ${preview.oabNumber}` : ""}</p>}
              {preview.address && <p>{preview.address}</p>}
              {preview.footerText && <p>{preview.footerText}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
