"use client";

import { useState } from "react";
import { Minus, Plus, ShoppingBag, Zap } from "lucide-react";
import type { Product } from "@/lib/supabase";
import { ONE_SIZE, useCartStore } from "@/lib/cart-store";

const MAX_QUANTITY = 10;
const STEP_BUTTON =
  "w-11 h-11 flex items-center justify-center text-muted hover:text-fg hover:bg-surface2 disabled:opacity-30 disabled:hover:bg-transparent transition-colors duration-300";

// Tamanho + quantidade + os dois botões de compra da página de produto.
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
          <legend className="flex w-full items-center justify-between font-mono text-xs uppercase tracking-widest mb-3">
            <span className="text-muted">{"// TAMANHO"}</span>
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
                  className={`min-w-12 px-3 py-3 font-mono text-sm rounded-sm border transition-all duration-300 active:scale-95 ${
                    active
                      ? "border-wine bg-wine/20 text-fg shadow-wine-subtle"
                      : "border-line bg-surface text-muted hover:border-wine/60 hover:text-fg"
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
        <span className="block font-mono text-xs text-muted uppercase tracking-widest mb-3">{"// QUANTIDADE"}</span>
        <div className="inline-flex items-center border border-line rounded-sm bg-surface">
          <button
            type="button"
            aria-label="Diminuir quantidade"
            disabled={quantity <= 1}
            onClick={() => setQuantity((current) => Math.max(1, current - 1))}
            className={STEP_BUTTON}
          >
            <Minus className="w-4 h-4" />
          </button>
          <span aria-live="polite" className="w-12 text-center font-mono text-base text-fg">
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

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          aria-haspopup="dialog"
          onClick={() => {
            if (addToCart()) openCart();
          }}
          className="flex-1 inline-flex items-center justify-center gap-2 bg-surface hover:bg-surface2 border border-line hover:border-wine/60 hover:shadow-wine-glow text-fg font-mono text-xs uppercase tracking-wider px-6 py-4 rounded-sm transition-all duration-300 active:scale-[0.98]"
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
          className="flex-1 inline-flex items-center justify-center gap-2 bg-wine hover:bg-wine-light text-white font-mono text-xs uppercase tracking-wider px-6 py-4 rounded-sm shadow-wine-glow transition-all duration-300 active:scale-[0.98]"
        >
          <Zap className="w-4 h-4" aria-hidden />
          Comprar agora
        </button>
      </div>
    </div>
  );
}
