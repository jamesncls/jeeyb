import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  // Linha de apoio abaixo do número (ex: a regra do cálculo).
  hint?: string;
  // Card principal: número com glow vinho.
  highlight?: boolean;
}

// Card de indicador do dashboard do admin.
export function StatCard({ icon: Icon, label, value, hint, highlight = false }: StatCardProps) {
  return (
    <div
      className={`bg-surface border rounded-sm p-5 sm:p-6 transition-[border-color,box-shadow] duration-300 hover:border-wine/60 hover:shadow-wine-glow ${
        highlight ? "border-wine/50" : "border-line"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="font-mono text-[11px] text-muted uppercase tracking-widest">{label}</span>
        <span className="p-2 bg-wine/15 border border-wine/40 rounded-sm">
          <Icon className="w-4 h-4 text-wine-glow" aria-hidden />
        </span>
      </div>
      <p
        className={`font-mono font-bold text-3xl sm:text-4xl text-fg mt-4 break-words ${
          highlight ? "[text-shadow:0_0_24px_rgba(160,52,74,0.7)]" : ""
        }`}
      >
        {value}
      </p>
      {hint && <p className="font-mono text-[11px] text-muted mt-2 leading-relaxed">{hint}</p>}
    </div>
  );
}
