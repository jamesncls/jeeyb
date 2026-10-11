"use client";

import { motion } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import { Product } from "@/lib/supabase";
import { formatPrice, productWhatsAppLink } from "@/lib/products";
import { ProductImage } from "./ProductImage";

const IMAGE_SIZES = "(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw";
const MAX_SIZES_SHOWN = 6;

export const productCardVariants = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
};

export function ProductCard({ product }: { product: Product }) {
  const sizes = product.sizes ?? [];
  const hiddenSizes = sizes.length - MAX_SIZES_SHOWN;

  return (
    <motion.article
      variants={productCardVariants}
      className="group relative flex flex-col bg-surface border border-line hover:border-wine/60 hover:shadow-wine-glow rounded-sm overflow-hidden transition-[border-color,box-shadow] duration-300"
    >
      {/* Imagem quadrada: zoom leve no hover e troca pra 2ª foto se existir */}
      <div className="relative w-full aspect-square bg-background overflow-hidden">
        <ProductImage
          src={product.images?.[0]}
          alt={product.name}
          sizes={IMAGE_SIZES}
          className="transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
        />
        {product.images?.[1] && (
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <ProductImage src={product.images[1]} alt="" sizes={IMAGE_SIZES} />
          </div>
        )}

        <div className="absolute top-3 left-3 bg-background/80 backdrop-blur-md border border-line px-2.5 py-1 rounded-sm">
          <span className="font-mono text-[10px] uppercase text-fg tracking-widest">[ {product.brand} ]</span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-4">
        <h3 className="font-display font-bold text-base text-fg group-hover:text-wine-glow transition-colors duration-300 line-clamp-2">
          {product.name}
        </h3>

        {/* Tamanhos disponíveis */}
        <div>
          <span className="block font-mono text-[10px] text-muted uppercase tracking-widest mb-1.5">{"// TAMANHOS"}</span>
          <ul className="flex flex-wrap gap-1">
            {sizes.length === 0 ? (
              <li className="font-mono text-[11px] text-fg border border-line px-1.5 py-0.5 rounded-sm">ÚNICO</li>
            ) : (
              sizes.slice(0, MAX_SIZES_SHOWN).map((size) => (
                <li key={size} className="font-mono text-[11px] text-fg border border-line px-1.5 py-0.5 rounded-sm">
                  {size}
                </li>
              ))
            )}
            {hiddenSizes > 0 && (
              <li className="font-mono text-[11px] text-muted px-1 py-0.5">+{hiddenSizes}</li>
            )}
          </ul>
        </div>

        <div className="mt-auto pt-4 border-t border-line/60">
          <span className="block font-mono text-[10px] text-muted uppercase tracking-widest">PREÇO</span>
          <span className="block font-mono font-bold text-xl text-fg">{formatPrice(product.price)}</span>

          <a
            href={productWhatsAppLink(product)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex items-center justify-center gap-2 bg-surface2 hover:bg-wine border border-line hover:border-wine-light text-fg font-mono text-xs uppercase tracking-wider px-3 py-3 rounded-sm transition-colors duration-300"
          >
            <ShoppingBag className="w-3.5 h-3.5" aria-hidden />
            COP / COMPRAR
          </a>
        </div>
      </div>
    </motion.article>
  );
}
