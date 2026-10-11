"use client";

import { useEffect, useState } from "react";
import { supabase, Product } from "@/lib/supabase";
import { ProductCard } from "./ProductCard";

export function ProductGrid() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      const { data } = await supabase.from("products").select("*").order("created_at", { ascending: false });
      if (data) setProducts(data);
      setLoading(false);
    }
    loadProducts();
  }, []);

  if (loading) {
    return (
      <section className="max-w-7xl mx-auto px-4 py-20 text-center">
        <span className="font-mono text-sm text-muted animate-pulse">// CARREGANDO GRAILS...</span>
      </section>
    );
  }

  return (
    <section id="shop" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 border-b border-line pb-6">
        <div>
          <span className="font-mono text-xs text-wine-light uppercase tracking-widest">// DROP DISPONÍVEL</span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mt-1">Catálogo Exclusivo</h2>
        </div>
        <p className="font-mono text-xs text-muted mt-2 md:mt-0">
          MOSTRANDO {products.length} ITEM(S)
        </p>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-16 border border-line rounded-sm">
          <p className="font-mono text-sm text-muted mb-4">Nenhum produto cadastrado ainda.</p>
          <a href="/admin" className="font-mono text-xs text-wine-glow hover:underline">
            → Vá para /admin para cadastrar o primeiro item
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}