"use client";

import { useState } from "react";
import { Pencil, Plus, Rotate3d, Upload, X } from "lucide-react";
import { supabase, Product } from "@/lib/supabase";
import { VIDEO_360_ACCEPT, uploadProduct360Video, uploadProductImage } from "@/lib/product-media";
import { FormError } from "@/components/account/FormError";
import { ProductImage } from "@/components/shop/ProductImage";

const BRANDS = ["Nike", "Jordan", "Adidas", "Streetwear"];
const CATEGORIES = [
  { value: "sneakers", label: "Tênis (Sneakers)" },
  { value: "jackets", label: "Casacos / Jaquetas" },
  { value: "accessories", label: "Acessórios" },
];
const DEFAULT_SIZES = "38, 39, 40, 41, 42, 43";

const INPUT =
  "w-full bg-background border border-line focus:border-wine px-3 py-2 text-sm rounded-sm outline-none transition-colors";
const LABEL = "block font-mono text-xs text-muted mb-1";
const DROPZONE =
  "relative border-2 border-dashed border-line hover:border-wine rounded-sm text-center cursor-pointer transition-colors bg-background";

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

interface ProductFormProps {
  // Produto em edição; null = cadastro de produto novo.
  product: Product | null;
  onSaved: (message: string) => void;
  onCancelEdit: () => void;
}

// Formulário de produto do admin: cadastra um novo ou edita um existente.
// Quem usa troca a `key` ao mudar de produto, então o estado sempre nasce dos dados certos.
export function ProductForm({ product, onSaved, onCancelEdit }: ProductFormProps) {
  const editing = !!product;

  const [name, setName] = useState(product?.name ?? "");
  const [brand, setBrand] = useState(product?.brand ?? BRANDS[0]);
  const [category, setCategory] = useState(product?.category ?? CATEGORIES[0].value);
  const [price, setPrice] = useState(product ? String(product.price) : "");
  const [sizes, setSizes] = useState(product ? (product.sizes ?? []).join(", ") : DEFAULT_SIZES);
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [video360Url, setVideo360Url] = useState(product?.model_3d_url ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [featured, setFeatured] = useState(product?.featured ?? false);

  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Marca fora da lista padrão (cadastrada direto no banco) continua selecionável.
  const brandOptions = BRANDS.includes(brand) ? BRANDS : [...BRANDS, brand];

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;

    setUploadingImages(true);
    setErrorMsg("");
    for (const file of files) {
      const result = await uploadProductImage(file);
      if ("error" in result) setErrorMsg(result.error);
      else setImages((current) => [...current, result.url]);
    }
    setUploadingImages(false);
  }

  async function handleVideoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setUploadingVideo(true);
    setErrorMsg("");
    const result = await uploadProduct360Video(file);
    if ("error" in result) setErrorMsg(result.error);
    else setVideo360Url(result.url);
    setUploadingVideo(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cleanName = name.trim();
    const numericPrice = Number.parseFloat(price.replace(",", "."));
    if (!cleanName || !Number.isFinite(numericPrice) || numericPrice <= 0 || images.length === 0) {
      setErrorMsg("Preenche nome, um preço válido e pelo menos 1 foto.");
      return;
    }

    const fields = {
      name: cleanName,
      brand,
      category,
      price: numericPrice,
      sizes: sizes.split(",").map((size) => size.trim()).filter(Boolean),
      images,
      description: description.trim(),
      featured,
      model_3d_url: video360Url || null,
    };

    setSaving(true);
    setErrorMsg("");

    // O slug só nasce no cadastro: editar não muda o link do produto.
    // .select() confirma que a linha foi gravada: com RLS, uma escrita negada não devolve erro.
    const { data, error } = product
      ? await supabase.from("products").update(fields).eq("id", product.id).select("id")
      : await supabase
          .from("products")
          .insert({ ...fields, slug: `${slugify(brand)}-${slugify(cleanName)}-${Date.now().toString().slice(-4)}` })
          .select("id");

    setSaving(false);

    if (error || !data || data.length === 0) {
      setErrorMsg(
        `Não deu pra salvar o produto${error ? `: ${error.message}` : ". Confere se sua conta ainda é admin."}`
      );
      return;
    }
    onSaved(product ? `"${cleanName}" atualizado.` : `"${cleanName}" publicado.`);
  }

  const busy = saving || uploadingImages || uploadingVideo;

  return (
    <div className={`bg-surface p-6 rounded-sm border h-fit ${editing ? "border-wine/60 shadow-wine-subtle" : "border-line"}`}>
      <div className="flex items-start justify-between gap-3 mb-6">
        <h2 className="font-display text-xl font-bold flex items-center gap-2 min-w-0">
          {editing ? (
            <Pencil className="w-5 h-5 text-wine-glow shrink-0" />
          ) : (
            <Plus className="w-5 h-5 text-wine shrink-0" />
          )}
          <span className="break-words min-w-0">{editing ? `Editando: ${product.name}` : "Novo Produto"}</span>
        </h2>
        {editing && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="shrink-0 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-muted hover:text-fg border border-line hover:border-wine/60 px-3 py-2 rounded-sm transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            Cancelar Edição
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <FormError message={errorMsg} />

        <div>
          <label htmlFor="product-name" className={LABEL}>
            {"// NOME DO PRODUTO"}
          </label>
          <input
            id="product-name"
            type="text"
            placeholder="Ex: Air Jordan 1 Retro High OG"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={INPUT}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="product-brand" className={LABEL}>
              {"// MARCA"}
            </label>
            <select id="product-brand" value={brand} onChange={(e) => setBrand(e.target.value)} className={INPUT}>
              {brandOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="product-category" className={LABEL}>
              {"// CATEGORIA"}
            </label>
            <select
              id="product-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={INPUT}
            >
              {CATEGORIES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="product-price" className={LABEL}>
              {"// PREÇO (R$)"}
            </label>
            <input
              id="product-price"
              type="number"
              step="0.01"
              min="0"
              placeholder="899.90"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className={INPUT}
            />
          </div>
          <div>
            <label htmlFor="product-sizes" className={LABEL}>
              {"// TAMANHOS (vírgula)"}
            </label>
            <input
              id="product-sizes"
              type="text"
              placeholder="38, 39, 40, 41"
              value={sizes}
              onChange={(e) => setSizes(e.target.value)}
              className={INPUT}
            />
          </div>
        </div>

        <div>
          <span className={LABEL}>{"// FOTOS DO PRODUTO"}</span>
          <div className={`${DROPZONE} p-6`}>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploadingImages}
              aria-label="Enviar fotos do produto"
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <Upload className="w-6 h-6 mx-auto text-muted mb-2" />
            <span className="font-mono text-xs text-muted">
              {uploadingImages ? "Enviando fotos..." : "Clique ou arraste fotos aqui"}
            </span>
          </div>

          {images.length > 0 && (
            <ul className="flex flex-wrap gap-2 mt-3">
              {images.map((url, index) => (
                <li key={url} className="relative w-16 h-16 border border-line rounded-sm overflow-hidden group">
                  <ProductImage src={url} alt="" sizes="64px" />
                  {index === 0 && (
                    <span className="absolute bottom-0 inset-x-0 bg-background/80 font-mono text-[8px] uppercase tracking-wider text-center text-fg">
                      capa
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => setImages((current) => current.filter((item) => item !== url))}
                    aria-label={`Remover foto ${index + 1}`}
                    className="absolute top-0.5 right-0.5 p-0.5 bg-background/80 text-fg hover:text-wine-glow rounded-sm"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <span className={LABEL}>{"// VÍDEO 360° (.MP4) — OPCIONAL"}</span>
          {video360Url ? (
            <div className="flex items-center justify-between gap-3 border border-wine/60 bg-wine/15 px-3 py-2.5 rounded-sm">
              <span className="inline-flex items-center gap-2 font-mono text-xs text-fg">
                <Rotate3d className="w-4 h-4 text-wine-glow" />
                [ VÍDEO 360° PRONTO ]
              </span>
              <button
                type="button"
                onClick={() => setVideo360Url("")}
                className="inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-wider text-muted hover:text-wine-glow transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                Remover
              </button>
            </div>
          ) : (
            <div className={`${DROPZONE} p-4`}>
              <input
                type="file"
                accept={VIDEO_360_ACCEPT}
                onChange={handleVideoUpload}
                disabled={uploadingVideo}
                aria-label="Enviar vídeo 360° (.mp4 ou .webm)"
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <Rotate3d className="w-5 h-5 mx-auto text-muted mb-1.5" />
              <span className="font-mono text-xs text-muted">
                {uploadingVideo
                  ? "Enviando vídeo 360°..."
                  : "Giro completo do produto em .mp4 ou .webm (o cliente arrasta pra girar)"}
              </span>
            </div>
          )}
        </div>

        <div>
          <label htmlFor="product-description" className={LABEL}>
            {"// DESCRIÇÃO / DETALHES"}
          </label>
          <textarea
            id="product-description"
            rows={3}
            placeholder="Edição especial, acompanha caixa original..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={`${INPUT} resize-none`}
          />
        </div>

        <div className="flex items-center gap-2 pt-2">
          <input
            type="checkbox"
            id="product-featured"
            checked={featured}
            onChange={(e) => setFeatured(e.target.checked)}
            className="accent-wine w-4 h-4"
          />
          <label htmlFor="product-featured" className="font-mono text-xs text-fg">
            Destacar na Home (Featured Drop)
          </label>
        </div>

        <button
          type="submit"
          disabled={busy}
          className="w-full bg-wine hover:bg-wine-light text-white font-mono text-xs uppercase tracking-wider py-3 rounded-sm transition-all shadow-wine-glow disabled:opacity-50"
        >
          {saving ? "SALVANDO..." : editing ? "SALVAR ALTERAÇÕES" : "PUBLICAR PRODUTO"}
        </button>
      </form>
    </div>
  );
}
