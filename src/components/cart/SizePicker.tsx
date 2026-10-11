"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ShoppingBag, X } from "lucide-react";
import { useCartStore } from "@/lib/cart-store";
import { formatPrice } from "@/lib/products";
import { useModal } from "@/lib/use-modal";
import { ProductImage } from "@/components/shop/ProductImage";

const EASE = [0.22, 1, 0.36, 1] as const;

// Popup rápido de tamanho, aberto pela store quando o produto tem mais de um.
export function SizePicker() {
  const product = useCartStore((state) => state.sizePickerProduct);
  const closeSizePicker = useCartStore((state) => state.closeSizePicker);
  const addItem = useCartStore((state) => state.addItem);
  const openCart = useCartStore((state) => state.openCart);
  const panelRef = useModal<HTMLDivElement>(!!product, closeSizePicker);

  // Guardar o produto junto faz a escolha zerar sozinha quando o popup abre pra outro item.
  const [selection, setSelection] = useState<{ productId: string; size: string } | null>(null);
  const selectedSize = product && selection?.productId === product.id ? selection.size : null;

  function handleAdd() {
    if (!product || !selectedSize) return;
    addItem(product, selectedSize);
    setSelection(null);
    closeSizePicker();
    openCart();
  }

  return (
    <AnimatePresence>
      {product && (
        <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeSizePicker}
            aria-hidden
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />

          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={`Escolher tamanho: ${product.name}`}
            tabIndex={-1}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="relative w-full sm:max-w-sm p-5 bg-surface border border-line rounded-sm shadow-wine-glow outline-none"
          >
            <div className="flex items-start gap-4">
              <div className="relative w-16 h-16 shrink-0 bg-background border border-line rounded-sm overflow-hidden">
                <ProductImage src={product.images?.[0]} alt="" sizes="64px" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="block font-mono text-[10px] text-wine-light uppercase tracking-widest">
                  [ {product.brand} ]
                </span>
                <h2 className="font-display font-bold text-base text-fg line-clamp-2">{product.name}</h2>
                <span className="block font-mono font-bold text-sm text-fg mt-0.5">{formatPrice(product.price)}</span>
              </div>
              <button
                type="button"
                aria-label="Fechar"
                onClick={closeSizePicker}
                className="shrink-0 p-2 -mt-2 -mr-2 text-muted hover:text-fg transition-colors duration-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <fieldset className="mt-5">
              <legend className="font-mono text-xs text-muted uppercase tracking-widest mb-3">
                {"// ESCOLHE O TAMANHO"}
              </legend>
              <div className="grid grid-cols-4 gap-2">
                {product.sizes.map((size) => {
                  const active = size === selectedSize;
                  return (
                    <button
                      key={size}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setSelection({ productId: product.id, size })}
                      className={`font-mono text-sm py-3 rounded-sm border transition-all duration-300 ${
                        active
                          ? "border-wine bg-wine/20 text-fg shadow-wine-subtle"
                          : "border-line bg-background text-muted hover:border-wine/60 hover:text-fg"
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <button
              type="button"
              onClick={handleAdd}
              disabled={!selectedSize}
              className="mt-5 w-full inline-flex items-center justify-center gap-2 bg-wine hover:bg-wine-light text-white font-mono text-xs uppercase tracking-wider py-4 rounded-sm transition-all duration-300 shadow-wine-glow active:scale-[0.98] disabled:opacity-40 disabled:shadow-none"
            >
              <ShoppingBag className="w-4 h-4" aria-hidden />
              {selectedSize ? `Adicionar tam ${selectedSize}` : "Escolhe um tamanho"}
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
