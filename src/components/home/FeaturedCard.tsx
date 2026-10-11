"use client";

import { ShoppingBag } from "lucide-react";
import { Product } from "@/lib/supabase";
import { formatPrice } from "@/lib/products";
import { useCartStore } from "@/lib/cart-store";
import { ProductImage } from "@/components/shop/ProductImage";

// `wide`: card único ocupando a linha toda, com foto e texto lado a lado no desktop.
export function FeaturedCard({ product, wide = false }: { product: Product; wide?: boolean }) {
  const requestAdd = useCartStore((state) => state.requestAdd);

  return (
    <article
      className={`group relative h-full flex flex-col bg-surface border border-line hover:border-wine/60 hover:shadow-wine-glow rounded-sm overflow-hidden transition-[border-color,box-shadow] duration-300 ${
        wide ? "lg:flex-row" : ""
      }`}
    >
      <div
        className={`relative overflow-hidden bg-background aspect-[4/3] ${wide ? "lg:w-3/5 lg:aspect-[16/10]" : ""}`}
      >
        <ProductImage
          src={product.images?.[0]}
          alt={product.name}
          sizes={wide ? "(min-width: 1024px) 60vw, 100vw" : "(min-width: 640px) 50vw, 85vw"}
          className="transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
        />
        <div className="absolute top-3 left-3 bg-wine/90 backdrop-blur-md border border-wine-light px-2.5 py-1 rounded-sm">
          <span className="font-mono text-[10px] uppercase text-white tracking-widest">[ HYPED DROP ]</span>
        </div>
      </div>

      <div className={`flex flex-1 flex-col justify-between gap-6 p-5 sm:p-6 ${wide ? "lg:p-10" : ""}`}>
        <div>
          <span className="font-mono text-[10px] sm:text-xs text-wine-light uppercase tracking-widest">
            [ {product.brand} ] // {product.category}
          </span>
          <h3
            className={`font-display font-bold tracking-tight text-fg mt-2 line-clamp-2 text-xl sm:text-2xl ${
              wide ? "lg:text-4xl" : ""
            }`}
          >
            {product.name}
          </h3>
          {product.description && (
            <p className="font-sans text-sm text-muted mt-3 line-clamp-2 leading-relaxed">{product.description}</p>
          )}
        </div>

        <div className="flex items-end justify-between gap-4">
          <div>
            <span className="block font-mono text-[10px] text-muted uppercase tracking-widest">PREÇO</span>
            <span className="block font-mono font-bold text-xl sm:text-2xl text-fg">{formatPrice(product.price)}</span>
          </div>
          <button
            type="button"
            aria-haspopup="dialog"
            onClick={() => requestAdd(product)}
            className="inline-flex items-center gap-1.5 bg-wine hover:bg-wine-light text-white font-mono text-xs uppercase tracking-wider px-4 py-3 rounded-sm shadow-wine-glow transition-colors duration-300"
          >
            <ShoppingBag className="w-3.5 h-3.5" aria-hidden />
            COP
          </button>
        </div>
      </div>
    </article>
  );
}
