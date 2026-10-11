"use client";

import { useState } from "react";
import { AlertTriangle, ArrowLeft, MessageCircle } from "lucide-react";
import { useCartStore } from "@/lib/cart-store";
import { formatPrice } from "@/lib/products";
import { createOrderId, orderWhatsAppLink, saveOrder } from "@/lib/orders";

const INPUT =
  "w-full bg-background border border-line focus:border-wine px-3 py-2.5 text-sm rounded-sm outline-none transition-colors duration-300";

interface CheckoutFormProps {
  onBack: () => void;
  onDone: (result: { orderId: string; whatsappUrl: string }) => void;
}

export function CheckoutForm({ onBack, onDone }: CheckoutFormProps) {
  const items = useCartStore((state) => state.items);
  const total = useCartStore((state) => state.getTotalPrice());
  const clearCart = useCartStore((state) => state.clearCart);

  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (items.length === 0) return;
    if (name.trim().length < 2 || location.trim().length < 2) {
      setErrorMsg("Preenche seu nome e sua cidade/UF pra gente fechar o pedido.");
      return;
    }

    const order = {
      id: createOrderId(),
      customer: { name: name.trim(), location: location.trim() },
      items,
      total,
    };
    const whatsappUrl = orderWhatsAppLink(order);

    // Abre ainda dentro do clique (senão o navegador bloqueia como popup).
    // Se mesmo assim bloquear, a tela de confirmação tem o link pra abrir na mão.
    const opened = window.open(whatsappUrl, "_blank");
    if (opened) opened.opener = null;

    // Não espera o Supabase: salvar o pedido nunca pode travar a ida pro WhatsApp.
    void saveOrder(order);

    clearCart();
    onDone({ orderId: order.id, whatsappUrl });
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-1 min-h-0 flex-col">
      <div className="flex-1 min-h-0 overflow-y-auto px-5 py-5 space-y-5">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-muted hover:text-fg transition-colors duration-300"
        >
          <ArrowLeft className="w-3.5 h-3.5" aria-hidden />
          Voltar pro carrinho
        </button>

        <div>
          <span className="font-mono text-xs text-wine-light uppercase tracking-widest">{"// QUASE LÁ"}</span>
          <h3 className="font-display text-2xl font-bold tracking-tight lowercase text-fg mt-1">
            pra quem vai o pedido?
          </h3>
          <p className="font-sans text-sm text-muted mt-2 leading-relaxed">
            Só isso. Frete e pagamento a gente combina com você no WhatsApp.
          </p>
        </div>

        {errorMsg && (
          <div
            role="alert"
            className="p-3 bg-wine/20 border border-wine/50 rounded-sm text-fg flex items-start gap-2 font-mono text-xs leading-relaxed"
          >
            <AlertTriangle className="w-4 h-4 text-wine-glow shrink-0 mt-0.5" aria-hidden />
            <span>{errorMsg}</span>
          </div>
        )}

        <div>
          <label htmlFor="checkout-name" className="block font-mono text-xs text-muted mb-1">
            {"// SEU NOME"}
          </label>
          <input
            id="checkout-name"
            type="text"
            autoComplete="name"
            placeholder="Como a gente te chama?"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={INPUT}
          />
        </div>

        <div>
          <label htmlFor="checkout-location" className="block font-mono text-xs text-muted mb-1">
            {"// CIDADE / UF"}
          </label>
          <input
            id="checkout-location"
            type="text"
            autoComplete="address-level2"
            placeholder="Ex: Joinville / SC"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className={INPUT}
          />
        </div>
      </div>

      <div className="shrink-0 border-t border-line px-5 py-5 space-y-4 bg-surface">
        <div className="flex items-baseline justify-between">
          <span className="font-mono text-xs text-muted uppercase tracking-widest">TOTAL</span>
          <span className="font-mono font-bold text-2xl text-fg">{formatPrice(total)}</span>
        </div>
        <button
          type="submit"
          className="w-full inline-flex items-center justify-center gap-2 bg-wine hover:bg-wine-light text-white font-mono text-xs uppercase tracking-wider py-4 rounded-sm transition-all duration-300 shadow-wine-glow active:scale-[0.98]"
        >
          <MessageCircle className="w-4 h-4" aria-hidden />
          Enviar pedido no WhatsApp
        </button>
      </div>
    </form>
  );
}
