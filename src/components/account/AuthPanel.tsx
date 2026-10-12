"use client";

import { useState } from "react";
import type { CustomerAuthResult } from "@/lib/customer-auth";
import { SignupForm } from "./SignupForm";
import { SigninForm } from "./SigninForm";

const TABS = [
  { id: "signin", label: "[ ENTRAR ]" },
  { id: "signup", label: "[ CRIAR CONTA ]" },
] as const;
export type AuthTab = (typeof TABS)[number]["id"];

interface AuthPanelProps {
  onAuthenticated: (result: CustomerAuthResult) => void;
  defaultTab?: AuthTab;
  // Texto dos botões de envio, ex: "CRIAR CONTA E ENVIAR PEDIDO".
  signupLabel?: string;
  signinLabel?: string;
}

// Login e cadastro da loja (cliente e admin entram pelo mesmo formulário). É o miolo da página
// /login e do modal do checkout; quem usa decide o que acontece depois de autenticar.
export function AuthPanel({
  onAuthenticated,
  defaultTab = "signin",
  signupLabel = "CRIAR CONTA",
  signinLabel = "ENTRAR",
}: AuthPanelProps) {
  const [tab, setTab] = useState<AuthTab>(defaultTab);

  return (
    <div className="flex flex-1 min-h-0 flex-col">
      <div role="tablist" aria-label="Entrar ou criar conta" className="shrink-0 grid grid-cols-2 gap-2 px-5 pt-4">
        {TABS.map((item) => {
          const active = item.id === tab;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(item.id)}
              className={`font-mono text-[11px] sm:text-xs uppercase tracking-wider px-2 py-3 rounded-sm border transition-all duration-300 ${
                active
                  ? "border-wine bg-wine/20 text-fg shadow-wine-subtle"
                  : "border-line bg-background text-muted hover:border-wine/60 hover:text-fg"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-5 py-5">
        {tab === "signin" ? (
          <SigninForm submitLabel={signinLabel} onSuccess={onAuthenticated} />
        ) : (
          <SignupForm submitLabel={signupLabel} onSuccess={onAuthenticated} />
        )}
      </div>
    </div>
  );
}
