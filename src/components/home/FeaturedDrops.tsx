"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useProducts } from "@/lib/products";
import { FeaturedCard } from "./FeaturedCard";

const FALLBACK_COUNT = 3;

const trackVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const slideVariants = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
};

export function FeaturedDrops() {
  const { products, status } = useProducts();
  const trackRef = useRef<HTMLDivElement>(null);

  // Sem nenhum produto marcado como featured, entram os mais recentes.
  const featured = products.filter((product) => product.featured);
  const drops = featured.length > 0 ? featured : products.slice(0, FALLBACK_COUNT);

  if (status === "error" || (status === "ready" && drops.length === 0)) return null;

  function scrollTrack(direction: 1 | -1) {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({ left: direction * track.clientWidth, behavior: "smooth" });
  }

  const single = drops.length === 1;
  const hasMore = drops.length > 2;

  return (
    <section id="drops" className="scroll-mt-20 border-b border-line">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24">
        <div className="flex items-end justify-between gap-4 mb-10">
          <div>
            <span className="font-mono text-xs text-wine-light uppercase tracking-widest">{"// FEATURED DROPS"}</span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight lowercase text-fg mt-1">
              o heat da vez.
            </h2>
          </div>

          {hasMore && (
            <div className="hidden sm:flex items-center gap-2">
              <button
                type="button"
                aria-label="Drops anteriores"
                onClick={() => scrollTrack(-1)}
                className="p-2.5 bg-surface border border-line hover:border-wine/60 hover:shadow-wine-subtle text-fg rounded-sm transition-all duration-300"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                aria-label="Próximos drops"
                onClick={() => scrollTrack(1)}
                className="p-2.5 bg-surface border border-line hover:border-wine/60 hover:shadow-wine-subtle text-fg rounded-sm transition-all duration-300"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {status === "loading" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6" aria-busy="true">
            {[0, 1].map((index) => (
              <div
                key={index}
                className={`bg-surface border border-line rounded-sm overflow-hidden animate-pulse ${index === 1 ? "hidden sm:block" : ""}`}
              >
                <div className="aspect-[4/3] bg-surface2" />
                <div className="p-6 space-y-3">
                  <div className="h-3 w-1/3 bg-surface2" />
                  <div className="h-6 w-2/3 bg-surface2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Carrossel com scroll-snap: 2 cards por vez no desktop, swipe no mobile.
          <motion.div
            ref={trackRef}
            variants={trackVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.15 }}
            className="-mx-4 px-4 sm:mx-0 sm:px-0 flex gap-4 sm:gap-6 overflow-x-auto snap-x snap-mandatory scroll-px-4 sm:scroll-px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {drops.map((product) => (
              <motion.div
                key={product.id}
                variants={slideVariants}
                className={`snap-start shrink-0 ${
                  single ? "w-full" : "w-[85%] sm:w-[calc(50%-0.75rem)]"
                }`}
              >
                <FeaturedCard product={product} wide={single} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}
