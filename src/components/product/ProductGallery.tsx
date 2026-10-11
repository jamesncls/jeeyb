"use client";

import { useCallback, useState } from "react";
import { Box } from "lucide-react";
import { ProductImage } from "@/components/shop/ProductImage";
import { ModelViewer3D } from "./ModelViewer3D";

const MODEL = "model";

interface ProductGalleryProps {
  images: string[];
  name: string;
  modelUrl?: string | null;
}

// Mídia principal grande + miniaturas clicáveis. Com modelo 3D, ele é a primeira mídia.
export function ProductGallery({ images, name, modelUrl }: ProductGalleryProps) {
  const [modelFailed, setModelFailed] = useState(false);
  const handleModelError = useCallback(() => setModelFailed(true), []);

  const hasModel = !!modelUrl && !modelFailed;
  const media = hasModel ? [MODEL, ...images] : images;

  const [activeIndex, setActiveIndex] = useState(0);
  const active = media[Math.min(activeIndex, Math.max(media.length - 1, 0))];
  const showingModel = hasModel && active === MODEL;

  return (
    <div className="flex flex-col gap-3">
      <div className="relative w-full aspect-square bg-surface border border-line rounded-sm overflow-hidden">
        {showingModel && modelUrl ? (
          <>
            {/* Glow vinho atrás do modelo */}
            <div className="absolute inset-0 bg-radial from-wine/25 via-transparent to-transparent pointer-events-none" />
            <div className="absolute inset-0">
              <ModelViewer3D src={modelUrl} alt={`Modelo 3D: ${name}`} poster={images[0]} onError={handleModelError} />
            </div>
            <div className="absolute top-3 left-3 bg-wine/90 backdrop-blur-md border border-wine-light px-2.5 py-1 rounded-sm pointer-events-none">
              <span className="font-mono text-[10px] uppercase text-white tracking-widest">[ 360° INTERATIVO ]</span>
            </div>
            <p className="absolute bottom-3 inset-x-3 text-center font-mono text-[10px] uppercase tracking-widest text-muted pointer-events-none">
              ARRASTE PRA GIRAR · SCROLL OU PINÇA PRA ZOOM
            </p>
          </>
        ) : (
          <ProductImage key={active} src={active} alt={name} sizes="(min-width: 1024px) 50vw, 100vw" priority />
        )}
      </div>

      {media.length > 1 && (
        <ul className="grid grid-cols-5 gap-2 sm:gap-3">
          {media.map((item, index) => {
            const selected = item === active;
            const isModel = hasModel && item === MODEL;
            return (
              <li key={item}>
                <button
                  type="button"
                  aria-label={isModel ? "Ver modelo 3D" : `Ver foto ${hasModel ? index : index + 1} de ${images.length}`}
                  aria-pressed={selected}
                  onClick={() => setActiveIndex(index)}
                  className={`relative block w-full aspect-square bg-surface rounded-sm overflow-hidden border transition-all duration-300 ${
                    selected
                      ? "border-wine shadow-wine-subtle"
                      : "border-line opacity-60 hover:opacity-100 hover:border-wine/60"
                  }`}
                >
                  {isModel ? (
                    <span className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-wine-glow">
                      <Box className="w-5 h-5" aria-hidden />
                      <span className="font-mono text-[10px] uppercase tracking-widest text-fg">3D</span>
                    </span>
                  ) : (
                    <ProductImage src={item} alt="" sizes="(min-width: 1024px) 10vw, 20vw" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
