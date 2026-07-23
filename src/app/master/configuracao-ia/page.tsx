import type { Metadata } from "next";
import { getGlobalAiSettings } from "@/lib/data/master";
import { AiSettingsForm } from "@/components/master/AiSettingsForm";

export const metadata: Metadata = { title: "Configuração da IA — Master — NEXO Jurídico" };

export default async function AiSettingsPage() {
  const settings = await getGlobalAiSettings();

  if (!settings) {
    return (
      <div className="mx-auto max-w-[820px]">
        <p className="text-sm text-white/60">
          Não foi possível carregar a configuração de IA. Verifique se a migração de banco foi aplicada.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[820px]">
      <h1 className="text-2xl font-bold text-white">Configuração da IA</h1>
      <p className="mt-1 text-sm text-white/50">
        Provedor e modelo únicos usados por todos os escritórios nesta versão. A chave de API é cifrada e nunca é
        exibida novamente após salva.
      </p>

      <div className="mt-8 rounded-nexo-card border border-white/10 bg-white/[0.03] p-6 sm:p-8">
        <AiSettingsForm settings={settings} />
      </div>
    </div>
  );
}
