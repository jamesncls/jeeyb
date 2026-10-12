"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MailCheck } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { resolvePostLoginTarget } from "@/lib/auth-redirect";
import type { CustomerAuthResult } from "@/lib/customer-auth";
import { AuthPanel } from "./AuthPanel";

// Miolo da página /login: o AuthPanel num card, mais o roteamento de depois do login.
export function LoginView() {
  const router = useRouter();
  const next = useSearchParams().get("next");
  // Conta criada esperando a confirmação do e-mail: guarda pra onde o link foi mandado.
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [redirecting, setRedirecting] = useState(false);

  const goToDestination = useCallback(async () => {
    setRedirecting(true);
    const target = await resolvePostLoginTarget(next);
    if (target.admin) window.location.assign(target.path);
    else router.replace(target.path);
  }, [next, router]);

  // Quem já chega logado (ou acabou de confirmar o e-mail pelo link) não precisa do formulário.
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event !== "INITIAL_SESSION" || !session) return;
      // Fora do callback: chamar o Supabase aqui dentro trava o cliente de auth.
      setTimeout(() => void goToDestination(), 0);
    });
    return () => data.subscription.unsubscribe();
  }, [goToDestination]);

  function handleAuthenticated(result: CustomerAuthResult) {
    if (result.awaitingEmailConfirmation) setPendingEmail(result.email);
    else void goToDestination();
  }

  if (redirecting) {
    return (
      <div
        role="status"
        className="bg-surface border border-line rounded-sm shadow-wine-glow px-5 py-16 text-center font-mono text-sm text-muted animate-pulse"
      >
        {"// ENTRANDO..."}
      </div>
    );
  }

  if (pendingEmail) {
    return (
      <div className="bg-surface border border-line rounded-sm shadow-wine-glow px-5 py-10 flex flex-col items-center text-center gap-4">
        <MailCheck className="w-10 h-10 text-wine-glow" aria-hidden />
        <span className="font-mono text-xs text-wine-light uppercase tracking-widest">{"// QUASE LÁ"}</span>
        <h1 className="font-display text-2xl font-bold tracking-tight lowercase text-fg">confirma seu e-mail.</h1>
        <p className="font-sans text-sm text-muted leading-relaxed max-w-sm">
          Mandamos um link pra <span className="text-fg break-all">{pendingEmail}</span>. Abre ele e depois entra com
          seu e-mail e senha.
        </p>
        <button
          type="button"
          onClick={() => setPendingEmail(null)}
          className="mt-2 font-mono text-xs uppercase tracking-wider text-fg border border-line hover:border-wine hover:shadow-wine-glow px-4 py-3 rounded-sm transition-all duration-300"
        >
          Voltar pro login
        </button>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-line rounded-sm shadow-wine-glow">
      <header className="px-5 pt-5">
        <span className="font-mono text-xs text-wine-light uppercase tracking-widest">{"// SUA CONTA"}</span>
        <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight lowercase text-fg mt-1">
          entra ou cria sua conta.
        </h1>
        <p className="font-sans text-sm text-muted mt-2 leading-relaxed">
          Seus dados de entrega ficam salvos e o próximo pedido sai com um clique.
        </p>
      </header>
      <AuthPanel onAuthenticated={handleAuthenticated} />
    </div>
  );
}
