import { Suspense } from "react";
import type { Metadata } from "next";
import { LoginForm } from "@/components/admin/LoginForm";

export const metadata: Metadata = {
  title: "Login admin — jeeyb",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <main className="relative min-h-screen bg-background text-fg flex items-center justify-center px-4 py-16 overflow-hidden">
      {/* Grid de fundo futurista */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] max-w-full h-[320px] bg-wine/20 blur-[140px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-sm">
        <div className="mb-8">
          <span className="font-mono text-xs text-wine-light uppercase tracking-widest">// MANAGEMENT HUB</span>
          <h1 className="font-display text-3xl font-bold tracking-tight lowercase mt-1">acesso restrito.</h1>
          <p className="font-mono text-xs text-muted mt-2">[ ADMIN ] só a staff da jeeyb passa daqui.</p>
        </div>

        {/* useSearchParams no form exige um boundary de Suspense */}
        <Suspense fallback={<div className="h-72 bg-surface border border-line rounded-sm animate-pulse" />}>
          <LoginForm />
        </Suspense>

        <a href="/" className="inline-block mt-6 font-mono text-xs text-muted hover:text-white transition-colors">
          ← Voltar para a Loja
        </a>
      </div>
    </main>
  );
}
