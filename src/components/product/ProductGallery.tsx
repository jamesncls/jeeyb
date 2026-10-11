"use client";

import { useState } from "react";
import { ProductImage } from "@/components/shop/ProductImage";

// Foto principal grande + miniaturas clicáveis.
export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = Math.min(activeIndex, Math.max(images.length - 1, 0));

  return (
    <div className="flex flex-col gap-3">
      <div className="relative w-full aspect-square bg-surface border border-line rounded-sm overflow-hidden">
        <ProductImage
          key={images[active]}
          src={images[active]}
          alt={name}
          sizes="(min-width: 1024px) 50vw, 100vw"
          priority
        />
      </div>

      {images.length > 1 && (
        <ul className="grid grid-cols-5 gap-2 sm:gap-3">
          {images.map((image, index) => {
            const selected = index === active;
            return (
              <li key={image}>
                <button
                  type="button"
                  aria-label={`Ver foto ${index + 1} de ${images.length}`}
                  aria-pressed={selected}
                  onClick={() => setActiveIndex(index)}
                  className={`relative block w-full aspect-square bg-surface rounded-sm overflow-hidden border transition-all duration-300 ${
                    selected
                      ? "border-wine shadow-wine-subtle"
                      : "border-line opacity-60 hover:opacity-100 hover:border-wine/60"
                  }`}
                >
                  <ProductImage src={image} alt="" sizes="(min-width: 1024px) 10vw, 20vw" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
