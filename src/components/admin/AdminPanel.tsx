"use client";

import { useState, useEffect } from "react";
import { supabase, Product } from "@/lib/supabase";
import { Plus, Upload, Trash2, CheckCircle2, Image as ImageIcon, LogOut } from "lucide-react";

export function AdminPanel({ adminEmail }: { adminEmail: string }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [signingOut, setSigningOut] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("Nike");
  const [category, setCategory] = useState("sneakers");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [sizes, setSizes] = useState("38, 39, 40, 41, 42, 43");
  const [featured, setFeatured] = useState(false);
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    const { data } = await supabase.from("products").select("*").order("created_at", { ascending: false });
    if (data) setProducts(data);
  }

  // Upload de Imagens direto pro Supabase Storage
  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const newImageUrls: string[] = [...images];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error } = await supabase.storage.from("products").upload(filePath, file);

      if (error) {
        console.error("Erro no upload:", error);
        alert(`Erro no upload da imagem ${file.name}`);
      } else {
        const { data: publicUrlData } = supabase.storage.from("products").getPublicUrl(filePath);
        newImageUrls.push(publicUrlData.publicUrl);
      }
    }

    setImages(newImageUrls);
    setUploading(false);
  }

  function slugify(text: string) {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !price || images.length === 0) {
      alert("Preencha Nome, Preço e adicione pelo menos 1 foto!");
      return;
    }

    setLoading(true);
    const slug = `${slugify(brand)}-${slugify(name)}-${Date.now().toString().slice(-4)}`;
    const sizesArray = sizes.split(",").map((s) => s.trim()).filter(Boolean);

    const { error } = await supabase.from("products").insert([
      {
        name,
        slug,
        brand,
        category,
        price: parseFloat(price),
        sizes: sizesArray,
        images,
        description,
        featured,
      },
    ]);

    setLoading(false);

    if (error) {
      alert(`Erro ao salvar produto: ${error.message}`);
    } else {
      setSuccessMsg("Produto cadastrado com sucesso!");
      // Limpa Formulário
      setName("");
      setPrice("");
      setDescription("");
      setImages([]);
      fetchProducts();
      setTimeout(() => setSuccessMsg(""), 4000);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Tem certeza que quer apagar esse produto?")) return;
    await supabase.from("products").delete().eq("id", id);
    fetchProducts();
  }

  async function handleLogout() {
    setSigningOut(true);
    await supabase.auth.signOut();
    // Navegação completa: passa pelo proxy de novo, já sem a sessão.
    window.location.assign("/admin/login");
  }

  return (
    <div className="min-h-screen bg-background text-fg p-6 sm:p-10 font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-line pb-6 mb-8">
          <div>
            <span className="font-mono text-xs text-wine-light tracking-widest">// MANAGEMENT HUB</span>
            <h1 className="font-display text-3xl font-bold">Painel de Produtos — jeeyb</h1>
            <p className="font-mono text-xs text-muted mt-1 break-all">[ ADMIN ] {adminEmail}</p>
          </div>
          <div className="flex items-center gap-3">
            <a href="/" className="font-mono text-xs text-muted hover:text-white border border-line px-4 py-2 rounded-sm">
              ← Voltar para a Loja
            </a>
            <button
              type="button"
              onClick={handleLogout}
              disabled={signingOut}
              className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-fg border border-line hover:border-wine hover:shadow-wine-glow px-4 py-2 rounded-sm transition-all duration-300 disabled:opacity-50"
            >
              <LogOut className="w-3.5 h-3.5" />
              {signingOut ? "SAINDO..." : "SAIR / LOGOUT"}
            </button>
          </div>
        </header>

        {successMsg && (
          <div className="mb-6 p-4 bg-wine/20 border border-wine/50 rounded-sm text-wine-glow flex items-center gap-2 font-mono text-sm">
            <CheckCircle2 className="w-5 h-5" />
            {successMsg}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* FORMULÁRIO DE CADASTRO */}
          <div className="lg:col-span-5 bg-surface p-6 rounded-sm border border-line h-fit">
            <h2 className="font-display text-xl font-bold mb-6 flex items-center gap-2">
              <Plus className="w-5 h-5 text-wine" /> Novo Produto
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block font-mono text-xs text-muted mb-1">// NOME DO PRODUTO</label>
                <input
                  type="text"
                  placeholder="Ex: Air Jordan 1 Retro High OG"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-background border border-line focus:border-wine px-3 py-2 text-sm rounded-sm outline-none transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-xs text-muted mb-1">// MARCA</label>
                  <select
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full bg-background border border-line focus:border-wine px-3 py-2 text-sm rounded-sm outline-none"
                  >
                    <option value="Nike">Nike</option>
                    <option value="Jordan">Jordan</option>
                    <option value="Adidas">Adidas</option>
                    <option value="Streetwear">Streetwear</option>
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-xs text-muted mb-1">// CATEGORIA</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-background border border-line focus:border-wine px-3 py-2 text-sm rounded-sm outline-none"
                  >
                    <option value="sneakers">Tênis (Sneakers)</option>
                    <option value="jackets">Casacos / Jaquetas</option>
                    <option value="accessories">Acessórios</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-xs text-muted mb-1">// PREÇO (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="899.90"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full bg-background border border-line focus:border-wine px-3 py-2 text-sm rounded-sm outline-none"
                  />
                </div>

                <div>
                  <label className="block font-mono text-xs text-muted mb-1">// TAMANHOS (virgula)</label>
                  <input
                    type="text"
                    placeholder="38, 39, 40, 41"
                    value={sizes}
                    onChange={(e) => setSizes(e.target.value)}
                    className="w-full bg-background border border-line focus:border-wine px-3 py-2 text-sm rounded-sm outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-xs text-muted mb-1">// FOTOS DO PRODUTO</label>
                <div className="relative border-2 border-dashed border-line hover:border-wine p-6 rounded-sm text-center cursor-pointer transition-colors bg-background">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <Upload className="w-6 h-6 mx-auto text-muted mb-2" />
                  <span className="font-mono text-xs text-muted">
                    {uploading ? "Enviando imagens..." : "Clique ou arraste fotos aqui"}
                  </span>
                </div>

                {/* Previews das fotos */}
                {images.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {images.map((url, idx) => (
                      <div key={idx} className="relative w-14 h-14 border border-line rounded-sm overflow-hidden">
                        {/* eslint-disable-next-html-element-suppress */}
                        <img src={url} alt="preview" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block font-mono text-xs text-muted mb-1">// DESCRIÇÃO / DETALHES</label>
                <textarea
                  rows={3}
                  placeholder="Edição especial, acompanha caixa original..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-background border border-line focus:border-wine px-3 py-2 text-sm rounded-sm outline-none resize-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="featured"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="accent-wine w-4 h-4"
                />
                <label htmlFor="featured" className="font-mono text-xs text-fg">
                  Destacar na Home (Featured Drop)
                </label>
              </div>

              <button
                type="submit"
                disabled={loading || uploading}
                className="w-full bg-wine hover:bg-wine-light text-white font-mono text-xs uppercase tracking-wider py-3 rounded-sm transition-all shadow-wine-glow disabled:opacity-50"
              >
                {loading ? "CADASTRANDO..." : "PUBLICAR PRODUTO"}
              </button>
            </form>
          </div>

          {/* LISTA DE PRODUTOS CADASTRADOS */}
          <div className="lg:col-span-7">
            <h2 className="font-display text-xl font-bold mb-6">// PRODUTOS NO SITE ({products.length})</h2>

            {products.length === 0 ? (
              <div className="p-12 border border-line text-center font-mono text-muted text-sm rounded-sm">
                Nenhum produto cadastrado ainda. Use o formulário ao lado para adicionar o primeiro grail!
              </div>
            ) : (
              <div className="space-y-3">
                {products.map((p) => (
                  <div key={p.id} className="bg-surface border border-line p-4 rounded-sm flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-background border border-line rounded-sm overflow-hidden flex items-center justify-center shrink-0">
                        {p.images?.[0] ? (
                          <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="w-6 h-6 text-muted" />
                        )}
                      </div>

                      <div>
                        <span className="font-mono text-[10px] text-wine-light uppercase">{p.brand} // {p.category}</span>
                        <h3 className="font-display font-bold text-sm text-white">{p.name}</h3>
                        <p className="font-mono text-xs text-muted">
                          R$ {p.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDelete(p.id)}
                      className="p-2 text-muted hover:text-red-400 hover:bg-red-950/30 rounded-sm transition-colors"
                      title="Apagar produto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}