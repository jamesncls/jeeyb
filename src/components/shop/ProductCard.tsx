"use client";

import { Product } from "@/lib/supabase";
import { ShoppingBag } from "lucide-react";

export function ProductCard({ product }: { product: Product }) {
  const whatsappUrl = `https://wa.me/5547988503312?text=${encodeURIComponent(
    `Salve! Tenho interesse no produto: ${product.name} (${product.brand}) - R$ ${product.price}`
  )}`;

  return (
    <div className="group relative bg-surface border border-line hover:border-wine/60 rounded-sm overflow-hidden transition-all duration-300 hover:shadow-wine-glow flex flex-col justify-between">
      <div>
        {/* Imagem do Produto */}
        <div className="relative w-full aspect-square bg-background overflow-hidden">
          {product.images?.[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted font-mono text-xs">
              [ SEM FOTO ]
            </div>
          )}

          {/* Badge de Marca */}
          <div className="absolute top-3 left-3 bg-background/80 backdrop-blur-md border border-line px-2.5 py-1 rounded-sm">
            <span className="font-mono text-[10px] uppercase text-white tracking-widest">
              [ {product.brand} ]
            </span>
          </div>
        </div>

        {/* Informações do Produto */}
        <div className="p-4 space-y-2">
          <h3 className="font-display font-bold text-base text-white group-hover:text-wine-light transition-colors line-clamp-1">
            {product.name}
          </h3>

          <p className="font-mono text-xs text-muted line-clamp-1">
            Tamanhos: {product.sizes?.join(", ") || "Único"}
          </p>
        </div>
      </div>

      {/* Preço e Botão de WhatsApp */}
      <div className="p-4 pt-0 flex items-center justify-between border-t border-line/40 mt-4">
        <div>
          <span className="block font-mono text-[10px] text-muted uppercase">PREÇO</span>
          <span className="font-mono font-bold text-lg text-white">
            R$ {product.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </span>
        </div>

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 bg-surface2 hover:bg-wine border border-line hover:border-wine-light text-white font-mono text-xs px-3 py-2 rounded-sm transition-all"
        >
          <ShoppingBag className="w-3.5 h-3.5 text-wine-glow group-hover:text-white" />
          COP
        </a>
      </div>
    </div>
  );
}