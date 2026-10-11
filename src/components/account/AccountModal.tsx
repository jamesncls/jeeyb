"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { LogOut, X } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { CustomerProfile, isProfileComplete, loadCustomerProfile } from "@/lib/profile";
import { useModal } from "@/lib/use-modal";
import { DeliverySummary } from "./DeliverySummary";
import { ProfileForm } from "./ProfileForm";

const EASE = [0.22, 1, 0.36, 1] as const;

interface AccountModalProps {
  // Cliente logado; null mantém o modal fechado.
  user: User | null;
  open: boolean;
  // Precisa ser estável (useCallback): entra nas dependências do useModal.
  onClose: () => void;
}

// "Minha conta" do cliente logado: dados de entrega salvos, edição e sair.
export function AccountModal({ user, open, onClose }: AccountModalProps) {
  const visible = open && !!user;
  const panelRef = useModal<HTMLDivElement>(visible, onClose);
  const [loaded, setLoaded] = useState<{ userId: string; profile: CustomerProfile | null } | null>(null);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!visible || !user) return;
    let active = true;
    loadCustomerProfile(user).then((profile) => {
      if (active) setLoaded({ userId: user.id, profile });
    });
    return () => {
      active = false;
    };
  }, [visible, user]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    onClose();
  }

  if (typeof document === "undefined") return null;

  const ready = !!user && loaded?.userId === user.id;
  const profile = ready ? loaded.profile : null;
  const showForm = ready && (editing || !isProfileComplete(profile));

  return createPortal(
    <AnimatePresence onExitComplete={() => setEditing(false)}>
      {visible && user && (
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
            aria-label="Minha conta"
            tabIndex={-1}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="relative w-full sm:max-w-lg max-h-[92svh] flex flex-col bg-surface border border-line rounded-sm shadow-wine-glow outline-none"
          >
            <header className="shrink-0 flex items-start justify-between gap-4 px-5 pt-5">
              <div className="min-w-0">
                <span className="font-mono text-xs text-wine-light uppercase tracking-widest">{"// MINHA CONTA"}</span>
                <p className="font-mono text-xs text-muted mt-1 break-all">{user.email}</p>
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

            <div className="flex-1 min-h-0 overflow-y-auto px-5 py-5 space-y-5">
              {!ready && <div aria-busy="true" className="h-28 bg-surface2 animate-pulse" />}

              {ready && showForm && (
                <ProfileForm
                  userId={user.id}
                  initial={profile}
                  submitLabel="SALVAR DADOS DE ENTREGA"
                  onCancel={editing ? () => setEditing(false) : undefined}
                  onSaved={(saved) => {
                    setLoaded({ userId: user.id, profile: saved });
                    setEditing(false);
                  }}
                />
              )}

              {ready && !showForm && profile && (
                <>
                  <DeliverySummary profile={profile} />
                  <button
                    type="button"
                    onClick={() => setEditing(true)}
                    className="font-mono text-xs uppercase tracking-wider text-muted hover:text-fg transition-colors duration-300"
                  >
                    Editar dados
                  </button>
                </>
              )}
            </div>

            <footer className="shrink-0 border-t border-line px-5 py-4">
              <button
                type="button"
                onClick={handleSignOut}
                className="w-full inline-flex items-center justify-center gap-2 font-mono text-xs uppercase tracking-wider text-fg border border-line hover:border-wine hover:shadow-wine-glow py-3 rounded-sm transition-all duration-300"
              >
                <LogOut className="w-3.5 h-3.5" aria-hidden />
                Sair da conta
              </button>
            </footer>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
