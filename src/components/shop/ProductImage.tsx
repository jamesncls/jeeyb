"use client";

import { useState } from "react";
import Image from "next/image";
import { ImageOff } from "lucide-react";

const STORAGE_PREFIX = `${process.env.NEXT_PUBLIC_SUPABASE_URL || ""}/storage/v1/object/public/`;

interface ProductImageProps {
  src?: string;
  alt: string;
  sizes: string;
  className?: string;
  priority?: boolean;
  onLoad?: (image: HTMLImageElement) => void;
}

// Preenche o container pai (que precisa ser `relative` e ter proporção definida).
// Sem foto, ou se a foto falhar ao carregar, mostra o placeholder.
export function ProductImage({ src, alt, sizes, className = "", priority = false, onLoad }: ProductImageProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  if (!src || failedSrc === src) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-surface2 text-muted">
        <ImageOff className="w-6 h-6" aria-hidden />
        <span className="font-mono text-[10px] uppercase tracking-widest">[ SEM FOTO ]</span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      // Só o Storage do Supabase está liberado no otimizador; outras URLs vão direto.
      unoptimized={!src.startsWith(STORAGE_PREFIX)}
      onError={() => setFailedSrc(src)}
      onLoad={onLoad ? (e) => onLoad(e.currentTarget) : undefined}
      className={`object-cover ${className}`}
    />
  );
}
