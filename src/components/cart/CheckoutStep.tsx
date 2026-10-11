"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useCartStore } from "@/lib/cart-store";
import { useCustomerSession } from "@/lib/use-customer";
import type { CustomerAuthResult } from "@/lib/customer-auth";
import { CustomerProfile, isProfileComplete, loadCustomerProfile } from "@/lib/profile";
import { createOrderId, orderWhatsAppLink, saveOrder } from "@/lib/orders";
import { formatPrice } from "@/lib/format";
import { CustomerAuthModal } from "@/components/account/CustomerAuthModal";
import { DeliverySummary } from "@/components/account/DeliverySummary";
import { ProfileForm } from "@/components/account/ProfileForm";

export interface SentOrder {
  orderId: string;
  whatsappUrl: string;
  // false quando o navegador bloqueou a aba nova: a tela de confirmação vira o botão de abrir.
  opened: boolean;
  awaitingEmailConfirmation: boolean;
}

interface CheckoutStepProps {
  // Precisa ser estável (useCallback): fecha o modal de login.
  onBack: () => void;
  onDone: (order: SentOrder) => void;
}

// Etapa de checkout da gaveta: logado mostra os dados de entrega e envia com 1 clique;
// deslogado abre o modal de cadastro/login e envia assim que ele termina.
export function CheckoutStep({ onBack, onDone }: CheckoutStepProps) {
  const session = useCustomerSession();
  const items = useCartStore((state) => state.items);
  const total = useCartStore((state) => state.getTotalPrice());
  const clearCart = useCartStore((state) => state.clearCart);

  // Perfil carregado, junto com de quem ele é (troca de conta invalida o que estava na tela).
  const [loaded, setLoaded] = useState<{ userId: string; profile: CustomerProfile | null } | null>(null);
  const [editing, setEditing] = useState(false);

  const user = session.user;
  useEffect(() => {
    if (!user) return;
    let active = true;
    loadCustomerProfile(user).then((profile) => {
      if (active) setLoaded({ userId: user.id, profile });
    });
    return () => {
      active = false;
    };
  }, [user]);

  const placeOrder = useCallback(
    (profile: CustomerProfile, userId: string | null, email: string | undefined, awaitingEmailConfirmation: boolean) => {
      if (items.length === 0) return;
      const order = { id: createOrderId(), userId, profile, email, items, total };
      const whatsappUrl = orderWhatsAppLink(order);

      // Logo após um clique o navegador deixa abrir a aba; depois de um cadastro demorado pode bloquear.
      const opened = window.open(whatsappUrl, "_blank");
      if (opened) opened.opener = null;

      // Não espera o Supabase: salvar o pedido nunca pode travar a ida pro WhatsApp.
      void saveOrder(order);

      clearCart();
      onDone({ orderId: order.id, whatsappUrl, opened: !!opened, awaitingEmailConfirmation });
    },
    [items, total, clearCart, onDone]
  );

  function handleAuthenticated(result: CustomerAuthResult) {
    if (isProfileComplete(result.profile)) {
      // Conta esperando confirmação de e-mail ainda não tem sessão: o pedido sai sem vínculo.
      placeOrder(
        result.profile,
        result.awaitingEmailConfirmation ? null : result.userId,
        result.email,
        result.awaitingEmailConfirmation
      );
    } else {
      // Login numa conta sem dados de entrega: a sessão entra e o formulário de endereço aparece.
      setLoaded({ userId: result.userId, profile: result.profile });
    }
  }

  const profile = user && loaded?.userId === user.id ? loaded.profile : null;
  const profileReady = !!user && loaded?.userId === user.id;
  const canSend = isProfileComplete(profile) && !editing;

  return (
    <div className="flex flex-1 min-h-0 flex-col">
      <div className="flex-1 min-h-0 overflow-y-auto px-5 py-5 space-y-5">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-muted hover:text-fg transition-colors duration-300"
        >
          <ArrowLeft className="w-3.5 h-3.5" aria-hidden />
          Voltar pro carrinho
        </button>

        {(session.status === "loading" || (user && !profileReady)) && (
          <div aria-busy="true" className="space-y-3 animate-pulse">
            <div className="h-4 w-32 bg-surface2" />
            <div className="h-28 bg-surface2" />
          </div>
        )}

        {session.status === "guest" && (
          <div>
            <span className="font-mono text-xs text-wine-light uppercase tracking-widest">{"// IDENTIFICAÇÃO"}</span>
            <h3 className="font-display text-2xl font-bold tracking-tight lowercase text-fg mt-1">
              entra ou cria sua conta.
            </h3>
            <p className="font-sans text-sm text-muted mt-2 leading-relaxed">
              Seus dados de entrega ficam salvos e o próximo pedido sai com um clique.
            </p>
          </div>
        )}

        {user && profileReady && canSend && profile && (
          <>
            <div>
              <span className="font-mono text-xs text-wine-light uppercase tracking-widest">{"// QUASE LÁ"}</span>
              <h3 className="font-display text-2xl font-bold tracking-tight lowercase text-fg mt-1">
                confere e manda.
              </h3>
            </div>

            <DeliverySummary profile={profile} email={user.email} />

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-xs uppercase tracking-wider">
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="text-muted hover:text-fg transition-colors duration-300"
              >
                Editar dados
              </button>
              <button
                type="button"
                onClick={() => void supabase.auth.signOut()}
                className="text-muted hover:text-wine-glow transition-colors duration-300"
              >
                Não é você? Sair
              </button>
            </div>
          </>
        )}

        {user && profileReady && !canSend && (
          <>
            <div>
              <span className="font-mono text-xs text-wine-light uppercase tracking-widest">{"// ENTREGA"}</span>
              <h3 className="font-display text-2xl font-bold tracking-tight lowercase text-fg mt-1">
                {editing ? "atualiza seus dados." : "pra onde a gente manda?"}
              </h3>
            </div>
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
          </>
        )}
      </div>

      {user && profileReady && canSend && profile && (
        <div className="shrink-0 border-t border-line px-5 py-5 space-y-4 bg-surface">
          <div className="flex items-baseline justify-between">
            <span className="font-mono text-xs text-muted uppercase tracking-widest">TOTAL</span>
            <span className="font-mono font-bold text-2xl text-fg">{formatPrice(total)}</span>
          </div>
          <button
            type="button"
            onClick={() => placeOrder(profile, user.id, user.email, false)}
            className="w-full inline-flex items-center justify-center gap-2 bg-wine hover:bg-wine-light text-white font-mono text-xs uppercase tracking-wider py-4 rounded-sm transition-all duration-300 shadow-wine-glow active:scale-[0.98]"
          >
            <MessageCircle className="w-4 h-4" aria-hidden />
            Enviar pedido pro WhatsApp
          </button>
        </div>
      )}

      <CustomerAuthModal
        open={session.status === "guest"}
        onClose={onBack}
        onAuthenticated={handleAuthenticated}
        signupLabel="CRIAR CONTA E ENVIAR PEDIDO"
        signinLabel="ENTRAR E ENVIAR PEDIDO"
      />
    </div>
  );
}
