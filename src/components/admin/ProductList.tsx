"use client";

import { Pencil, Rotate3d, Star, Trash2 } from "lucide-react";
import type { Product } from "@/lib/supabase";
import { formatPrice } from "@/lib/format";
import { ProductImage } from "@/components/shop/ProductImage";

interface ProductListProps {
  products: Product[];
  // Produto aberto no formulário (fica destacado na lista).
  editingId: string | null;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

// Lista de produtos do admin: cada linha abre o produto no formulário (editar) ou apaga.
export function ProductList({ products, editingId, onEdit, onDelete }: ProductListProps) {
  if (products.length === 0) {
    return (
      <div className="p-12 border border-line text-center font-mono text-muted text-sm rounded-sm">
        Nenhum produto cadastrado ainda. Use o formulário ao lado para adicionar o primeiro grail!
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {products.map((product) => {
        const editing = product.id === editingId;
        return (
          <li
            key={product.id}
            className={`bg-surface border rounded-sm flex items-stretch transition-all duration-300 ${
              editing ? "border-wine shadow-wine-subtle" : "border-line hover:border-wine/60"
            }`}
          >
            {/* A linha inteira (menos o apagar) abre a edição */}
            <button
              type="button"
              onClick={() => onEdit(product)}
              aria-label={`Editar ${product.name}`}
              aria-pressed={editing}
              className="group flex-1 min-w-0 flex items-center gap-4 p-4 text-left"
            >
              <div className="relative w-16 h-16 bg-background border border-line rounded-sm overflow-hidden shrink-0">
                <ProductImage src={product.images?.[0]} alt="" sizes="64px" />
              </div>

              <div className="flex-1 min-w-0">
                <span className="block font-mono text-[10px] text-wine-light uppercase truncate">
                  {product.brand} {"//"} {product.category}
                </span>
                <span className="block font-display font-bold text-sm text-fg truncate">{product.name}</span>
                <span className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs text-muted mt-0.5">
                  <span>{formatPrice(product.price)}</span>
                  <span>{(product.sizes ?? []).length} tam.</span>
                  {product.model_3d_url && (
                    <span className="inline-flex items-center gap-1 text-wine-glow">
                      <Rotate3d className="w-3 h-3" />
                      360°
                    </span>
                  )}
                  {product.featured && (
                    <span className="inline-flex items-center gap-1 text-wine-glow">
                      <Star className="w-3 h-3" />
                      destaque
                    </span>
                  )}
                </span>
              </div>

              <span
                className={`shrink-0 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider px-3 py-2 rounded-sm border transition-colors ${
                  editing
                    ? "border-wine bg-wine/20 text-fg"
                    : "border-line text-muted group-hover:border-wine/60 group-hover:text-fg"
                }`}
              >
                <Pencil className="w-3.5 h-3.5" />
                {editing ? "Editando" : "Editar"}
              </span>
            </button>

            <button
              type="button"
              onClick={() => onDelete(product)}
              aria-label={`Apagar ${product.name}`}
              title="Apagar produto"
              className="shrink-0 px-3 border-l border-line text-muted hover:text-red-400 hover:bg-red-950/30 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </li>
        );
      })}
    </ul>
  );
}
