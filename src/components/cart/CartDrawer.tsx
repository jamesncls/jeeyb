"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, MessageCircle, ShoppingBag, X } from "lucide-react";
import { useCartStore } from "@/lib/cart-store";
import { formatPrice } from "@/lib/format";
import { orderCode } from "@/lib/orders";
import { useModal } from "@/lib/use-modal";
import { CartItemRow } from "./CartItemRow";
import { CheckoutStep, SentOrder } from "./CheckoutStep";

const EASE = [0.22, 1, 0.36, 1] as const;

export function CartDrawer() {
  const isOpen = useCartStore((state) => state.isOpen);
  const closeCart = useCartStore((state) => state.closeCart);
  const items = useCartStore((state) => state.items);
  const totalItems = useCartStore((state) => state.getTotalItems());
  const totalPrice = useCartStore((state) => state.getTotalPrice());

  const step = useCartStore((state) => state.step);
  const setStep = useCartStore((state) => state.setStep);
  const [sentOrder, setSentOrder] = useState<SentOrder | null>(null);
  const backToCart = useCallback(() => setStep("cart"), [setStep]);
  const panelRef = useModal<HTMLDivElement>(isOpen, closeCart);

  // Lê o carrinho salvo no localStorage só depois do mount (ver skipHydration na store).
  useEffect(() => {
    void useCartStore.persist.rehydrate();
  }, []);

  function handleExitComplete() {
    setStep("cart");
    setSentOrder(null);
  }

  const view = sentOrder ? "done" : items.length === 0 ? "empty" : step;

  return (
    <AnimatePresence onExitComplete={handleExitComplete}>
      {isOpen && (
        <div className="fixed inset-0 z-[60]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={closeCart}
            aria-hidden
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />

          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Carrinho"
            tabIndex={-1}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.4, ease: EASE }}
            className="absolute inset-y-0 right-0 w-full max-w-md flex flex-col bg-surface border-l border-line shadow-[-24px_0_48px_rgba(0,0,0,0.6)] outline-none"
          >
            <header className="shrink-0 flex items-center justify-between px-5 h-16 border-b border-line">
              <div className="flex items-baseline gap-3">
                <h2 className="font-mono text-sm text-fg uppercase tracking-widest">{"// CARRINHO"}</h2>
                <span className="font-mono text-xs text-muted">
                  [ {totalItems} {totalItems === 1 ? "ITEM" : "ITENS"} ]
                </span>
              </div>
              <button
                type="button"
                aria-label="Fechar carrinho"
                onClick={closeCart}
                className="p-2 -mr-2 text-muted hover:text-fg transition-colors duration-300"
              >
                <X className="w-5 h-5" />
              </button>
            </header>

            {view === "done" && sentOrder && (
              <div className="flex-1 flex flex-col items-center justify-center text-center px-8 gap-4">
                <CheckCircle2 className="w-10 h-10 text-wine-glow" aria-hidden />
                <h3 className="font-display text-2xl font-bold tracking-tight lowercase text-fg">
                  {sentOrder.opened ? "pedido a caminho do whatsapp." : "pedido pronto. falta enviar."}
                </h3>
                <p className="font-sans text-sm text-muted leading-relaxed">
                  {sentOrder.opened
                    ? "É só apertar enviar na conversa que a gente confirma estoque, frete e pagamento com você."
                    : "Abre o WhatsApp no botão abaixo e aperta enviar: a gente confirma estoque, frete e pagamento com você."}
                </p>
                <span className="font-mono text-xs text-fg border border-line px-3 py-1.5 rounded-sm">
                  [ PEDIDO #{orderCode(sentOrder.orderId)} ]
                </span>
                {sentOrder.awaitingEmailConfirmation && (
                  <p className="font-mono text-[11px] text-muted leading-relaxed border border-line/60 px-3 py-2 rounded-sm">
                    Te mandamos um e-mail pra confirmar a conta. Confirmando, seus dados ficam salvos pro próximo pedido.
                  </p>
                )}
                <a
                  href={sentOrder.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`mt-2 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider px-4 py-3 rounded-sm transition-all duration-300 ${
                    sentOrder.opened
                      ? "text-fg border border-line hover:border-wine hover:shadow-wine-glow"
                      : "bg-wine hover:bg-wine-light text-white shadow-wine-glow"
                  }`}
                >
                  <MessageCircle className="w-4 h-4" aria-hidden />
                  {sentOrder.opened ? "Não abriu? Abrir WhatsApp" : "Abrir WhatsApp"}
                </a>
                <button
                  type="button"
                  onClick={closeCart}
                  className="font-mono text-xs uppercase tracking-wider text-muted hover:text-fg transition-colors duration-300"
                >
                  Continuar comprando
                </button>
              </div>
            )}

            {view === "empty" && (
              <div className="flex-1 flex flex-col items-center justify-center text-center px-8 gap-4">
                <ShoppingBag className="w-10 h-10 text-muted" aria-hidden />
                <h3 className="font-display text-2xl font-bold tracking-tight lowercase text-fg">
                  seu carrinho tá vazio.
                </h3>
                <p className="font-sans text-sm text-muted">Bora mudar isso. O heat tá no catálogo.</p>
                <a
                  href="#shop"
                  onClick={closeCart}
                  className="mt-2 inline-flex items-center justify-center bg-wine hover:bg-wine-light text-white font-mono text-xs uppercase tracking-wider px-6 py-3 rounded-sm transition-all duration-300 shadow-wine-glow"
                >
                  Ver catálogo
                </a>
              </div>
            )}

            {view === "cart" && (
              <>
                <ul className="flex-1 min-h-0 overflow-y-auto px-5">
                  {items.map((item) => (
                    <CartItemRow key={`${item.product.id}-${item.selectedSize}`} item={item} />
                  ))}
                </ul>

                <div className="shrink-0 border-t border-line px-5 py-5 space-y-4">
                  <dl className="space-y-2 font-mono text-xs uppercase tracking-wider">
                    <div className="flex items-center justify-between text-muted">
                      <dt>Subtotal</dt>
                      <dd className="text-fg">{formatPrice(totalPrice)}</dd>
                    </div>
                    <div className="flex items-center justify-between text-muted">
                      <dt>Frete</dt>
                      <dd className="normal-case tracking-normal">Calculado com o vendedor</dd>
                    </div>
                    <div className="flex items-baseline justify-between pt-3 border-t border-line/60">
                      <dt className="text-fg tracking-widest">Total</dt>
                      <dd className="font-bold text-2xl text-fg tracking-normal">{formatPrice(totalPrice)}</dd>
                    </div>
                  </dl>

                  <button
                    type="button"
                    onClick={() => setStep("checkout")}
                    className="w-full inline-flex items-center justify-center gap-2 bg-wine hover:bg-wine-light text-white font-mono text-xs uppercase tracking-wider py-4 rounded-sm transition-all duration-300 shadow-wine-glow active:scale-[0.98]"
                  >
                    <MessageCircle className="w-4 h-4" aria-hidden />
                    Finalizar pedido via WhatsApp
                  </button>
                </div>
              </>
            )}

            {view === "checkout" && <CheckoutStep onBack={backToCart} onDone={setSentOrder} />}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
