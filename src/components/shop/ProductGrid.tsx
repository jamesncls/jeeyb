"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { BRAND_FILTERS, CATEGORY_FILTERS, useProducts } from "@/lib/products";
import { FilterTabs } from "./FilterTabs";
import { ProductCard } from "./ProductCard";

const ALL = "all";
const BRAND_OPTIONS = [{ value: ALL, label: "Todos" }, ...BRAND_FILTERS.map((brand) => ({ value: brand.toLowerCase(), label: brand }))];
const CATEGORY_OPTIONS = [{ value: ALL, label: "Todos" }, ...CATEGORY_FILTERS];

const gridVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

export function ProductGrid() {
  const { products, status, retry } = useProducts();
  const [brand, setBrand] = useState(ALL);
  const [category, setCategory] = useState(ALL);

  const filtered = useMemo(
    () =>
      products.filter(
        (product) =>
          (brand === ALL || product.brand?.toLowerCase() === brand) &&
          (category === ALL || product.category?.toLowerCase() === category)
      ),
    [products, brand, category]
  );

  const hasFilter = brand !== ALL || category !== ALL;

  return (
    <section id="shop" className="scroll-mt-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-2 mb-8 border-b border-line pb-6">
        <div>
          <span className="font-mono text-xs text-wine-light uppercase tracking-widest">{"// CATÁLOGO"}</span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight lowercase text-fg mt-1">
            todo o heat em um lugar só.
          </h2>
        </div>
        <p className="font-mono text-xs text-muted" aria-live="polite">
          {status === "ready" ? `MOSTRANDO ${filtered.length} DE ${products.length} ITEM(S)` : " "}
        </p>
      </div>

      <div className="flex flex-col gap-4 mb-10">
        <FilterTabs label="Marca" options={BRAND_OPTIONS} value={brand} onChange={setBrand} />
        <FilterTabs label="Categoria" options={CATEGORY_OPTIONS} value={category} onChange={setCategory} />
      </div>

      {status === "loading" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" aria-busy="true">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="bg-surface border border-line rounded-sm overflow-hidden animate-pulse">
              <div className="aspect-square bg-surface2" />
              <div className="p-4 space-y-3">
                <div className="h-4 w-3/4 bg-surface2" />
                <div className="h-3 w-1/2 bg-surface2" />
                <div className="h-10 bg-surface2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {status === "error" && (
        <div className="text-center py-16 border border-line rounded-sm">
          <p className="font-mono text-sm text-muted mb-4">Não deu pra carregar o catálogo agora.</p>
          <button
            type="button"
            onClick={retry}
            className="font-mono text-xs uppercase tracking-wider text-fg border border-line hover:border-wine hover:shadow-wine-glow px-4 py-2 rounded-sm transition-all duration-300"
          >
            Tentar de novo
          </button>
        </div>
      )}

      {status === "ready" && filtered.length === 0 && (
        <div className="text-center py-16 border border-line rounded-sm">
          <p className="font-mono text-sm text-muted">
            {hasFilter ? "Nada nesse filtro por enquanto." : "Drop novo chegando. Fica de olho."}
          </p>
          {hasFilter && (
            <button
              type="button"
              onClick={() => {
                setBrand(ALL);
                setCategory(ALL);
              }}
              className="mt-4 font-mono text-xs uppercase tracking-wider text-fg border border-line hover:border-wine hover:shadow-wine-glow px-4 py-2 rounded-sm transition-all duration-300"
            >
              Limpar filtros
            </button>
          )}
        </div>
      )}

      {status === "ready" && filtered.length > 0 && (
        // A key refaz o stagger a cada troca de filtro.
        <motion.div
          key={`${brand}-${category}`}
          variants={gridVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.05 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </motion.div>
      )}
    </section>
  );
}
