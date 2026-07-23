export function StatCard({ label, value, tone = "default" }: { label: string; value: number | string; tone?: "default" | "warning" }) {
  return (
    <div className="rounded-nexo-card border border-white/10 bg-white/[0.03] p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-white/40">{label}</p>
      <p className={`mt-2 text-3xl font-bold ${tone === "warning" && Number(value) > 0 ? "text-nexo-error" : "text-white"}`}>
        {value}
      </p>
    </div>
  );
}
