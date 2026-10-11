"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import type { CustomerAuthResult } from "@/lib/customer-auth";
import { useModal } from "@/lib/use-modal";
import { SignupForm } from "./SignupForm";
import { SigninForm } from "./SigninForm";

const EASE = [0.22, 1, 0.36, 1] as const;

const TABS = [
  { id: "signup", label: "[ CRIAR CONTA ]" },
  { id: "signin", label: "[ JÁ TENHO CONTA ]" },
] as const;
type AuthTab = (typeof TABS)[number]["id"];

interface CustomerAuthModalProps {
  open: boolean;
  // Precisa ser estável (useCallback): entra nas dependências do useModal.
  onClose: () => void;
  onAuthenticated: (result: CustomerAuthResult) => void;
  // Texto dos botões de envio, ex: "CRIAR CONTA E ENVIAR PEDIDO".
  signupLabel?: string;
  signinLabel?: string;
}

// Modal de cadastro/login do cliente. Fica por cima da gaveta do carrinho.
export function CustomerAuthModal({
  open,
  onClose,
  onAuthenticated,
  signupLabel = "CRIAR CONTA",
  signinLabel = "ENTRAR",
}: CustomerAuthModalProps) {
  const [tab, setTab] = useState<AuthTab>("signup");
  const panelRef = useModal<HTMLDivElement>(open, onClose);

  // Portal no <body>: quem abre o modal (gaveta, navbar) tem transform/backdrop-filter,
  // que prenderiam um position: fixed dentro deles.
  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            aria-hidden
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />

          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Entrar ou criar conta"
            tabIndex={-1}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="relative w-full sm:max-w-lg max-h-[92svh] flex flex-col bg-surface border border-line rounded-sm shadow-wine-glow outline-none"
          >
            <header className="shrink-0 flex items-start justify-between gap-4 px-5 pt-5">
              <div>
                <span className="font-mono text-xs text-wine-light uppercase tracking-widest">{"// SUA CONTA"}</span>
                <h2 className="font-display text-2xl font-bold tracking-tight lowercase text-fg mt-1">
                  falta só se identificar.
                </h2>
              </div>
              <button
                type="button"
                aria-label="Fechar"
                onClick={onClose}
                className="shrink-0 p-2 -mt-2 -mr-2 text-muted hover:text-fg transition-colors duration-300"
              >
                <X className="w-5 h-5" />
              </button>
            </header>

            <div role="tablist" aria-label="Criar conta ou entrar" className="shrink-0 grid grid-cols-2 gap-2 px-5 pt-4">
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
              {tab === "signup" ? (
                <SignupForm submitLabel={signupLabel} onSuccess={onAuthenticated} />
              ) : (
                <SigninForm submitLabel={signinLabel} onSuccess={onAuthenticated} />
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
