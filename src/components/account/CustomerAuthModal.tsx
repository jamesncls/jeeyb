"use client";

import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import type { CustomerAuthResult } from "@/lib/customer-auth";
import { useModal } from "@/lib/use-modal";
import { AuthPanel } from "./AuthPanel";

const EASE = [0.22, 1, 0.36, 1] as const;

interface CustomerAuthModalProps {
  open: boolean;
  // Precisa ser estável (useCallback): entra nas dependências do useModal.
  onClose: () => void;
  onAuthenticated: (result: CustomerAuthResult) => void;
  // Texto dos botões de envio, ex: "CRIAR CONTA E ENVIAR PEDIDO".
  signupLabel?: string;
  signinLabel?: string;
}

// Modal de cadastro/login do checkout: é o mesmo AuthPanel da página /login, por cima da gaveta
// do carrinho, pra o cliente se identificar sem sair da compra.
export function CustomerAuthModal({ open, onClose, onAuthenticated, signupLabel, signinLabel }: CustomerAuthModalProps) {
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

            {/* No checkout quem chega é quase sempre cliente novo: abre na aba de cadastro. */}
            <AuthPanel
              defaultTab="signup"
              onAuthenticated={onAuthenticated}
              signupLabel={signupLabel}
              signinLabel={signinLabel}
            />
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
