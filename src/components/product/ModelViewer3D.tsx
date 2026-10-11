"use client";

import { useEffect, useRef } from "react";

interface ModelViewer3DProps {
  src: string;
  alt: string;
  // Foto mostrada enquanto o modelo baixa.
  poster?: string;
  onError: () => void;
}

// Viewer 3D interativo (.glb): arrastar gira, scroll/pinça dá zoom. Preenche o container pai.
export function ModelViewer3D({ src, alt, poster, onError }: ModelViewer3DProps) {
  const viewerRef = useRef<HTMLElement>(null);

  // A lib registra o custom element e só roda no browser; importada aqui, só entra no
  // bundle de quem abre um produto com modelo 3D.
  useEffect(() => {
    import("@google/model-viewer").catch(onError);
  }, [onError]);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    viewer.addEventListener("error", onError);
    return () => viewer.removeEventListener("error", onError);
  }, [onError]);

  return (
    <model-viewer
      ref={viewerRef}
      src={src}
      alt={alt}
      poster={poster}
      loading="eager"
      camera-controls
      auto-rotate
      auto-rotate-delay={1500}
      rotation-per-second="24deg"
      interaction-prompt="auto"
      touch-action="pan-y"
      shadow-intensity={1}
      shadow-softness={0.9}
      exposure={1}
      style={{ width: "100%", height: "100%", backgroundColor: "transparent" }}
    />
  );
}
