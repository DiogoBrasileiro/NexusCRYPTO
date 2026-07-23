"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/field";
import { updateTimezoneAction, type SettingsActionState } from "@/lib/actions/office-settings";

const TIMEZONES = ["America/Sao_Paulo", "America/Manaus", "America/Belem", "America/Rio_Branco", "America/Noronha"];

const initialState: SettingsActionState = { error: null };

export function TimezoneForm({ timezone }: { timezone: string }) {
  const [state, formAction, isPending] = useActionState(updateTimezoneAction, initialState);

  return (
    <form action={formAction} className="max-w-sm space-y-4">
      <div>
        <Label htmlFor="timezone">Fuso horário</Label>
        <select
          id="timezone"
          name="timezone"
          defaultValue={timezone}
          className="h-11 w-full rounded-nexo-field border border-nexo-border bg-white px-3.5 text-sm focus:border-nexo-lime-dark focus:outline-none"
        >
          {TIMEZONES.map((tz) => (
            <option key={tz} value={tz}>
              {tz.replace("America/", "").replace("_", " ")}
            </option>
          ))}
        </select>
      </div>

      <div>
        <Label htmlFor="locale">Idioma</Label>
        <select
          id="locale"
          disabled
          defaultValue="pt-BR"
          className="h-11 w-full rounded-nexo-field border border-nexo-border bg-nexo-panel-bg px-3.5 text-sm text-nexo-text-secondary"
        >
          <option value="pt-BR">Português (Brasil)</option>
        </select>
        <p className="mt-1.5 text-xs text-nexo-text-secondary">Único idioma disponível nesta versão.</p>
      </div>

      {state.error && <p className="text-sm font-medium text-nexo-error">{state.error}</p>}
      {state.success && <p className="text-sm font-medium text-nexo-success">Preferência salva.</p>}
      <Button type="submit" disabled={isPending} size="sm">
        {isPending ? "Salvando..." : "Salvar"}
      </Button>
    </form>
  );
}
