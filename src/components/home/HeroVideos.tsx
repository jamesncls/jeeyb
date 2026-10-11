"use client";

import { useEffect, useRef } from "react";

interface HeroVideosProps {
  // Vídeos com <video> montado (os já selecionados alguma vez).
  mounted: string[];
  active: string;
  shown: string;
  onReady: (src: string) => void;
  onFailed: (src: string) => void;
}

// Fundo da hero: os vídeos ficam empilhados e só o `shown` tem opacidade, então a troca é um crossfade.
export function HeroVideos({ mounted, active, shown, onReady, onFailed }: HeroVideosProps) {
  const videosRef = useRef(new Map<string, HTMLVideoElement>());

  // Toca só o que está visível ou entrando; o resto fica pausado.
  useEffect(() => {
    videosRef.current.forEach((video, src) => {
      if (src === active || src === shown) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  }, [active, shown, mounted]);

  return (
    <>
      {mounted.map((src) => (
        <video
          key={src}
          ref={(element) => {
            if (element) videosRef.current.set(src, element);
            else videosRef.current.delete(src);
          }}
          autoPlay
          muted
          loop
          playsInline
          preload={src === active ? "auto" : "metadata"}
          aria-hidden
          onCanPlay={() => onReady(src)}
          className={`absolute inset-0 w-full h-full object-cover contrast-125 motion-reduce:hidden transition-opacity duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            src === shown ? "opacity-35" : "opacity-0"
          }`}
        >
          <source src={src} type="video/mp4" onError={() => onFailed(src)} />
        </video>
      ))}
    </>
  );
}
