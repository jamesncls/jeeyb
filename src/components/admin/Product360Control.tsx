"use client";

import { useState } from "react";
import { Rotate3d, X } from "lucide-react";
import { supabase, Product } from "@/lib/supabase";
import { VIDEO_360_ACCEPT, uploadProduct360Video } from "@/lib/product-media";

interface Product360ControlProps {
  product: Pick<Product, "id" | "name" | "model_3d_url">;
  onChanged: () => void;
}

// Na lista de produtos do admin: anexa, troca ou remove o vídeo 360° de um produto já cadastrado.
export function Product360Control({ product, onChanged }: Product360ControlProps) {
  const [busy, setBusy] = useState(false);
  const hasVideo = !!product.model_3d_url;

  async function saveVideoUrl(url: string | null) {
    const { data, error } = await supabase
      .from("products")
      .update({ model_3d_url: url })
      .eq("id", product.id)
      .select("id");
    if (error || !data || data.length === 0) {
      alert(`Não deu pra salvar o vídeo 360° em "${product.name}"${error ? `: ${error.message}` : "."}`);
      return;
    }
    onChanged();
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setBusy(true);
    const result = await uploadProduct360Video(file);
    if ("error" in result) alert(result.error);
    else await saveVideoUrl(result.url);
    setBusy(false);
  }

  async function handleRemove() {
    if (!confirm(`Tirar o vídeo 360° de "${product.name}"?`)) return;
    setBusy(true);
    await saveVideoUrl(null);
    setBusy(false);
  }

  return (
    <div className="flex items-center gap-1">
      <label
        title={hasVideo ? "Trocar vídeo 360° (.mp4)" : "Adicionar vídeo 360° (.mp4)"}
        className={`relative inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider px-2.5 py-2 rounded-sm border cursor-pointer transition-colors ${
          hasVideo
            ? "border-wine/60 bg-wine/15 text-fg hover:border-wine"
            : "border-line text-muted hover:border-wine/60 hover:text-fg"
        } ${busy ? "opacity-50 pointer-events-none" : ""}`}
      >
        <Rotate3d className="w-3.5 h-3.5" />
        {busy ? "ENVIANDO..." : hasVideo ? "360° OK" : "+ 360°"}
        <input
          type="file"
          accept={VIDEO_360_ACCEPT}
          onChange={handleFile}
          disabled={busy}
          aria-label={`${hasVideo ? "Trocar" : "Adicionar"} vídeo 360° de ${product.name}`}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />
      </label>

      {hasVideo && (
        <button
          type="button"
          onClick={handleRemove}
          disabled={busy}
          title="Remover vídeo 360°"
          aria-label={`Remover vídeo 360° de ${product.name}`}
          className="p-2 text-muted hover:text-wine-glow rounded-sm transition-colors disabled:opacity-50"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
