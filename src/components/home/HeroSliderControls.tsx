"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface HeroSliderControlsProps {
  count: number;
  activeIndex: number;
  onPrevious: () => void;
  onNext: () => void;
  onSelect: (index: number) => void;
}

// No desktop as setas ficam nas laterais da hero; em telas menores descem pra linha dos indicadores,
// pra não cobrir a headline.
const ARROW =
  "absolute z-20 bottom-[3.125rem] lg:bottom-auto lg:top-1/2 lg:-translate-y-1/2 w-9 h-9 lg:w-12 lg:h-12 flex items-center justify-center border border-line bg-background/40 backdrop-blur-sm text-muted hover:text-fg hover:border-wine hover:shadow-wine-glow active:scale-95 rounded-sm transition-all duration-300";

export function HeroSliderControls({ count, activeIndex, onPrevious, onNext, onSelect }: HeroSliderControlsProps) {
  if (count < 2) return null;

  return (
    <>
      <button type="button" aria-label="Vídeo anterior" onClick={onPrevious} className={`${ARROW} left-4 lg:left-6`}>
        <ChevronLeft className="w-4 h-4 lg:w-5 lg:h-5" />
      </button>
      <button type="button" aria-label="Próximo vídeo" onClick={onNext} className={`${ARROW} right-4 lg:right-6`}>
        <ChevronRight className="w-4 h-4 lg:w-5 lg:h-5" />
      </button>

      <div className="absolute z-20 inset-x-0 bottom-11 h-12 flex items-center justify-center pointer-events-none">
        <ul className="flex items-center gap-1.5 pointer-events-auto">
          {Array.from({ length: count }, (_, index) => {
            const active = index === activeIndex;
            return (
              <li key={index}>
                <button
                  type="button"
                  aria-label={`Vídeo ${index + 1} de ${count}`}
                  aria-current={active ? "true" : undefined}
                  onClick={() => onSelect(index)}
                  className="group block py-3"
                >
                  <span
                    className={`block w-8 h-0.5 transition-[transform,background-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                      active ? "scale-x-100 bg-wine-glow shadow-wine-subtle" : "scale-x-50 bg-fg/30 group-hover:bg-fg/60"
                    }`}
                  />
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}
