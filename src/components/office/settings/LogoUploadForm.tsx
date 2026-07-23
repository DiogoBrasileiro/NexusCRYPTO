"use client";

import { useActionState } from "react";
import { uploadOfficeLogoAction, type SettingsActionState } from "@/lib/actions/office-settings";

const initialState: SettingsActionState = { error: null };

export function LogoUploadForm({ logoUrl }: { logoUrl: string | null }) {
  const [state, formAction, isPending] = useActionState(uploadOfficeLogoAction, initialState);

  return (
    <div className="flex items-center gap-4">
      <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-nexo-field border border-nexo-border bg-nexo-panel-bg">
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoUrl} alt="Logo do escritório" className="h-full w-full object-contain" />
        ) : (
          <span className="text-xs text-nexo-text-secondary">Sem logo</span>
        )}
      </div>
      <form action={formAction} className="flex items-center gap-3">
        <input type="file" name="logo" accept="image/*" required className="text-sm" />
        <button
          type="submit"
          disabled={isPending}
          className="h-9 shrink-0 rounded-nexo-pill bg-nexo-black px-4 text-xs font-semibold text-white hover:bg-nexo-black-secondary disabled:opacity-50"
        >
          {isPending ? "Enviando..." : "Enviar logo"}
        </button>
      </form>
      {state.error && <p className="text-xs font-medium text-nexo-error">{state.error}</p>}
    </div>
  );
}
