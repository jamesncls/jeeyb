import { Suspense } from "react";
import type { Metadata } from "next";
import { StoreShell } from "@/components/layout/StoreShell";
import { LoginView } from "@/components/account/LoginView";

export const metadata: Metadata = {
  title: "Entrar — jeeyb",
  robots: { index: false, follow: false },
};

// Login único da loja: cliente e admin entram por aqui; o destino depois do login sai do is_admin().
export default function LoginPage() {
  return (
    <StoreShell>
      <section className="relative min-h-[70svh] flex items-center justify-center overflow-hidden px-4 py-16">
        {/* Grid de fundo futurista */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] max-w-full h-[320px] bg-wine/20 blur-[140px] pointer-events-none" />

        <div className="relative z-10 w-full max-w-lg">
          {/* useSearchParams (o ?next=) exige um boundary de Suspense */}
          <Suspense fallback={<div className="h-96 bg-surface border border-line rounded-sm animate-pulse" />}>
            <LoginView />
          </Suspense>
        </div>
      </section>
    </StoreShell>
  );
}
