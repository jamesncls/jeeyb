"use client";

import { useState } from "react";
import { Box, X } from "lucide-react";
import { supabase, Product } from "@/lib/supabase";
import { MODEL_ACCEPT, uploadProductModel } from "@/lib/product-media";

interface ProductModelControlProps {
  product: Pick<Product, "id" | "name" | "model_3d_url">;
  onChanged: () => void;
}

// Na lista de produtos do admin: anexa, troca ou remove o modelo 3D de um produto já cadastrado.
export function ProductModelControl({ product, onChanged }: ProductModelControlProps) {
  const [busy, setBusy] = useState(false);
  const hasModel = !!product.model_3d_url;

  async function saveModelUrl(url: string | null) {
    const { data, error } = await supabase
      .from("products")
      .update({ model_3d_url: url })
      .eq("id", product.id)
      .select("id");
    if (error || !data || data.length === 0) {
      alert(`Não deu pra salvar o modelo 3D em "${product.name}"${error ? `: ${error.message}` : "."}`);
      return;
    }
    onChanged();
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setBusy(true);
    const result = await uploadProductModel(file);
    if ("error" in result) alert(result.error);
    else await saveModelUrl(result.url);
    setBusy(false);
  }

  async function handleRemove() {
    if (!confirm(`Tirar o modelo 3D de "${product.name}"?`)) return;
    setBusy(true);
    await saveModelUrl(null);
    setBusy(false);
  }

  return (
    <div className="flex items-center gap-1">
      <label
        title={hasModel ? "Trocar modelo 3D (.glb)" : "Adicionar modelo 3D (.glb)"}
        className={`relative inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider px-2.5 py-2 rounded-sm border cursor-pointer transition-colors ${
          hasModel
            ? "border-wine/60 bg-wine/15 text-fg hover:border-wine"
            : "border-line text-muted hover:border-wine/60 hover:text-fg"
        } ${busy ? "opacity-50 pointer-events-none" : ""}`}
      >
        <Box className="w-3.5 h-3.5" />
        {busy ? "ENVIANDO..." : hasModel ? "3D OK" : "+ 3D"}
        <input
          type="file"
          accept={MODEL_ACCEPT}
          onChange={handleFile}
          disabled={busy}
          aria-label={`${hasModel ? "Trocar" : "Adicionar"} modelo 3D de ${product.name}`}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />
      </label>

      {hasModel && (
        <button
          type="button"
          onClick={handleRemove}
          disabled={busy}
          title="Remover modelo 3D"
          aria-label={`Remover modelo 3D de ${product.name}`}
          className="p-2 text-muted hover:text-wine-glow rounded-sm transition-colors disabled:opacity-50"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
