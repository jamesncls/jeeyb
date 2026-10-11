import Link from "next/link";
import type { Metadata } from "next";
import { StoreShell } from "@/components/layout/StoreShell";

export const metadata: Metadata = {
  title: "Não encontrado — jeeyb",
};

export default function NotFound() {
  return (
    <StoreShell>
      <section className="relative min-h-[70svh] flex items-center justify-center overflow-hidden px-4 py-20">
        {/* Grid de fundo futurista */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] max-w-full h-[320px] bg-wine/20 blur-[140px] pointer-events-none" />

        <div className="relative z-10 text-center flex flex-col items-center">
          <span className="font-mono text-xs text-wine-light uppercase tracking-widest">{"// ERRO 404"}</span>
          <p aria-hidden className="font-mono font-bold text-7xl sm:text-9xl text-fg/10 leading-none mt-4">
            404
          </p>
          <h1 className="font-display text-3xl sm:text-5xl font-bold tracking-tight lowercase text-fg mt-4">
            esse drop não tá aqui.
          </h1>
          <p className="font-sans text-muted text-base max-w-md mt-4 leading-relaxed">
            O produto pode ter esgotado ou o link tá errado. O resto do heat continua no catálogo.
          </p>
          <Link
            href="/#shop"
            className="mt-8 inline-flex items-center justify-center bg-wine hover:bg-wine-light text-white font-mono text-sm uppercase tracking-wider px-8 py-4 rounded-sm transition-all duration-300 shadow-wine-glow hover:scale-[1.02] active:scale-[0.98]"
          >
            Voltar pro catálogo
          </Link>
        </div>
      </section>
    </StoreShell>
  );
}
