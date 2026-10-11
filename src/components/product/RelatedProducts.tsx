"use client";

import { motion } from "framer-motion";
import type { Product } from "@/lib/supabase";
import { ProductCard } from "@/components/shop/ProductCard";

const gridVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

// Carrossel com swipe no mobile, grid a partir do sm.
export function RelatedProducts({ products }: { products: Product[] }) {
  if (products.length === 0) return null;

  return (
    <section className="border-t border-line">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <span className="font-mono text-xs text-wine-light uppercase tracking-widest">{"// MAIS HEAT"}</span>
        <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight lowercase text-fg mt-1 mb-10">
          você também pode gostar.
        </h2>

        <motion.div
          variants={gridVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
          className="-mx-4 px-4 sm:mx-0 sm:px-0 flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:grid sm:grid-cols-2 sm:gap-6 sm:overflow-visible lg:grid-cols-4"
        >
          {products.map((product) => (
            <div key={product.id} className="snap-start shrink-0 w-[72%] sm:w-auto">
              <ProductCard product={product} />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
