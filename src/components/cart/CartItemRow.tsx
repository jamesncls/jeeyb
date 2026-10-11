"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import { CartItem, useCartStore } from "@/lib/cart-store";
import { formatPrice } from "@/lib/products";
import { ProductImage } from "@/components/shop/ProductImage";

const STEP_BUTTON =
  "w-8 h-8 flex items-center justify-center text-muted hover:text-fg hover:bg-surface2 transition-colors duration-300";

export function CartItemRow({ item }: { item: CartItem }) {
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const { product, selectedSize, quantity } = item;

  return (
    <li className="flex gap-4 py-4 border-b border-line/60 last:border-b-0">
      <div className="relative w-20 h-20 shrink-0 bg-background border border-line rounded-sm overflow-hidden">
        <ProductImage src={product.images?.[0]} alt={product.name} sizes="80px" />
      </div>

      <div className="flex-1 min-w-0 flex flex-col justify-between gap-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <span className="block font-mono text-[10px] text-wine-light uppercase tracking-widest">
              [ {product.brand} ]
            </span>
            <h3 className="font-display font-bold text-sm text-fg line-clamp-2">{product.name}</h3>
            <span className="block font-mono text-[11px] text-muted uppercase mt-0.5">TAM: {selectedSize}</span>
          </div>
          <button
            type="button"
            aria-label={`Remover ${product.name} (tam ${selectedSize})`}
            onClick={() => removeItem(product.id, selectedSize)}
            className="shrink-0 p-1.5 -mr-1.5 text-muted hover:text-wine-glow transition-colors duration-300"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="inline-flex items-center border border-line rounded-sm">
            <button
              type="button"
              aria-label="Diminuir quantidade"
              onClick={() => updateQuantity(product.id, selectedSize, quantity - 1)}
              className={STEP_BUTTON}
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span aria-live="polite" className="w-8 text-center font-mono text-sm text-fg">
              {quantity}
            </span>
            <button
              type="button"
              aria-label="Aumentar quantidade"
              onClick={() => updateQuantity(product.id, selectedSize, quantity + 1)}
              className={STEP_BUTTON}
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
          <span className="font-mono font-bold text-sm text-fg">{formatPrice(product.price * quantity)}</span>
        </div>
      </div>
    </li>
  );
}
