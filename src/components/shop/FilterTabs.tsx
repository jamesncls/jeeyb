"use client";

interface FilterTabsProps {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}

// Fileira de filtros; no mobile rola na horizontal em vez de quebrar linha.
export function FilterTabs({ label, options, value, onChange }: FilterTabsProps) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
      <span className="font-mono text-[10px] text-muted uppercase tracking-widest sm:w-24 shrink-0">{`// ${label}`}</span>
      <div
        role="group"
        aria-label={`Filtrar por ${label.toLowerCase()}`}
        className="-mx-4 px-4 sm:mx-0 sm:px-0 flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {options.map((option) => {
          const active = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(option.value)}
              className={`shrink-0 font-mono text-xs uppercase tracking-wider px-3.5 py-2 rounded-sm border transition-all duration-300 ${
                active
                  ? "border-wine bg-wine/20 text-fg shadow-wine-subtle"
                  : "border-line bg-surface text-muted hover:border-wine/60 hover:text-fg"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
