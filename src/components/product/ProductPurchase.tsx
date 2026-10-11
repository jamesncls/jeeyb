"use client";

import { useState } from "react";
import { Minus, Plus, ShoppingBag, Zap } from "lucide-react";
import type { Product } from "@/lib/supabase";
import { ONE_SIZE, useCartStore } from "@/lib/cart-store";

const MAX_QUANTITY = 10;
const STEP_BUTTON =
  "w-10 h-10 flex items-center justify-center rounded-sm border border-line text-fg/70 hover:text-fg hover:border-wine hover:shadow-wine-subtle disabled:opacity-30 disabled:hover:border-line disabled:hover:shadow-none transition-all duration-300";
const LABEL = "font-mono text-xs uppercase tracking-widest text-fg/60";

// Tamanho + quantidade + os dois botões de compra da página de produto.
// Tudo flutua direto sobre o cenário: sem caixas nem fundos, só borda fina que acende em vinho.
export function ProductPurchase({ product }: { product: Product }) {
  const addItem = useCartStore((state) => state.addItem);
  const openCart = useCartStore((state) => state.openCart);
  const openCheckout = useCartStore((state) => state.openCheckout);

  const sizes = product.sizes ?? [];
  const [selectedSize, setSelectedSize] = useState<string | null>(sizes.length === 1 ? sizes[0] : null);
  const [quantity, setQuantity] = useState(1);
  const [sizeMissing, setSizeMissing] = useState(false);

  function addToCart() {
    const size = sizes.length === 0 ? ONE_SIZE : selectedSize;
    if (!size) {
      setSizeMissing(true);
      return false;
    }
    addItem(product, size, quantity);
    return true;
  }

  return (
    <div className="space-y-6">
      {sizes.length > 0 && (
        <fieldset>
          <legend className={`flex w-full items-center gap-3 mb-3 ${LABEL}`}>
            <span>{"// TAMANHO"}</span>
            {selectedSize && <span className="text-fg">[ {selectedSize} ]</span>}
          </legend>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => {
              const active = size === selectedSize;
              return (
                <button
                  key={size}
                  type="button"
                  aria-pressed={active}
                  onClick={() => {
                    setSelectedSize(size);
                    setSizeMissing(false);
                  }}
                  className={`min-w-12 px-3 py-2.5 font-mono text-sm rounded-sm border transition-all duration-300 active:scale-95 ${
                    active
                      ? "border-wine-glow bg-wine/25 text-fg shadow-wine-glow"
                      : "border-line text-fg/75 hover:border-wine hover:text-fg hover:shadow-wine-subtle"
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
          {sizeMissing && (
            <p role="alert" className="mt-3 font-mono text-xs text-wine-glow">
              Escolhe um tamanho antes de copar.
            </p>
          )}
        </fieldset>
      )}

      <div>
        <span className={`block mb-3 ${LABEL}`}>{"// QUANTIDADE"}</span>
        <div className="inline-flex items-center gap-1">
          <button
            type="button"
            aria-label="Diminuir quantidade"
            disabled={quantity <= 1}
            onClick={() => setQuantity((current) => Math.max(1, current - 1))}
            className={STEP_BUTTON}
          >
            <Minus className="w-4 h-4" />
          </button>
          <span aria-live="polite" className="w-12 text-center font-mono text-lg text-fg">
            {quantity}
          </span>
          <button
            type="button"
            aria-label="Aumentar quantidade"
            disabled={quantity >= MAX_QUANTITY}
            onClick={() => setQuantity((current) => Math.min(MAX_QUANTITY, current + 1))}
            className={STEP_BUTTON}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-1">
        <button
          type="button"
          aria-haspopup="dialog"
          onClick={() => {
            if (addToCart()) openCart();
          }}
          className="flex-1 inline-flex items-center justify-center gap-2 whitespace-nowrap border border-wine/50 hover:border-wine-glow shadow-wine-subtle hover:shadow-wine-glow text-fg font-mono text-xs uppercase tracking-wider px-4 py-4 rounded-sm transition-all duration-300 active:scale-[0.98]"
        >
          <ShoppingBag className="w-4 h-4" aria-hidden />
          Adicionar ao carrinho
        </button>
        <button
          type="button"
          aria-haspopup="dialog"
          onClick={() => {
            if (addToCart()) openCheckout();
          }}
          className="flex-1 inline-flex items-center justify-center gap-2 whitespace-nowrap bg-wine hover:bg-wine-light text-white font-mono text-xs uppercase tracking-wider px-4 py-4 rounded-sm shadow-wine-glow transition-all duration-300 active:scale-[0.98]"
        >
          <Zap className="w-4 h-4" aria-hidden />
          Comprar agora
        </button>
      </div>
    </div>
  );
}
