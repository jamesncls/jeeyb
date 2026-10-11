"use client";

import { useCallback, useState } from "react";
import { Rotate3d } from "lucide-react";
import { ProductImage } from "@/components/shop/ProductImage";
import { Interactive360Video } from "./Interactive360Video";

const VIDEO_360 = "video-360";

interface ProductGalleryProps {
  images: string[];
  name: string;
  video360Url?: string | null;
}

// Mídia principal grande + miniaturas clicáveis. Com vídeo 360°, ele é a primeira mídia.
export function ProductGallery({ images, name, video360Url }: ProductGalleryProps) {
  const [videoFailed, setVideoFailed] = useState(false);
  const handleVideoError = useCallback(() => setVideoFailed(true), []);

  const hasVideo = !!video360Url && !videoFailed;
  const media = hasVideo ? [VIDEO_360, ...images] : images;

  const [activeIndex, setActiveIndex] = useState(0);
  const active = media[Math.min(activeIndex, Math.max(media.length - 1, 0))];
  const showingVideo = hasVideo && active === VIDEO_360;

  return (
    <div className="flex flex-col gap-3">
      <div className="relative w-full aspect-square bg-surface border border-line rounded-sm overflow-hidden">
        {showingVideo && video360Url ? (
          <>
            <Interactive360Video
              src={video360Url}
              label={`Giro 360° de ${name}`}
              poster={images[0]}
              onError={handleVideoError}
            />
            <div className="absolute top-3 left-3 bg-wine/90 backdrop-blur-md border border-wine-light px-2.5 py-1 rounded-sm pointer-events-none">
              <span className="font-mono text-[10px] uppercase text-white tracking-widest">[ 360° INTERATIVO ]</span>
            </div>
          </>
        ) : (
          <ProductImage key={active} src={active} alt={name} sizes="(min-width: 1024px) 50vw, 100vw" priority />
        )}
      </div>

      {media.length > 1 && (
        <ul className="grid grid-cols-5 gap-2 sm:gap-3">
          {media.map((item, index) => {
            const selected = item === active;
            const isVideo = hasVideo && item === VIDEO_360;
            return (
              <li key={item}>
                <button
                  type="button"
                  aria-label={isVideo ? "Ver giro 360°" : `Ver foto ${hasVideo ? index : index + 1} de ${images.length}`}
                  aria-pressed={selected}
                  onClick={() => setActiveIndex(index)}
                  className={`relative block w-full aspect-square bg-surface rounded-sm overflow-hidden border transition-all duration-300 ${
                    selected
                      ? "border-wine shadow-wine-subtle"
                      : "border-line opacity-60 hover:opacity-100 hover:border-wine/60"
                  }`}
                >
                  {isVideo ? (
                    <span className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-wine-glow">
                      <Rotate3d className="w-5 h-5" aria-hidden />
                      <span className="font-mono text-[10px] uppercase tracking-widest text-fg">360°</span>
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
