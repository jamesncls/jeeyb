"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { supabase, Product } from "@/lib/supabase";
import { refreshProductsCache } from "@/app/admin/actions";
import { ProductForm } from "./ProductForm";
import { ProductList } from "./ProductList";

// Aba de produtos: formulário (novo/edição) à esquerda, lista à direita.
export function ProductsPanel() {
  const [products, setProducts] = useState<Product[]>([]);
  const [editing, setEditing] = useState<Product | null>(null);
  // Muda a cada cadastro pra zerar o formulário de "novo produto".
  const [formVersion, setFormVersion] = useState(0);
  const [successMsg, setSuccessMsg] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (active && data) setProducts(data as Product[]);
      });
    return () => {
      active = false;
    };
  }, [reloadKey]);

  useEffect(() => {
    if (!successMsg) return;
    const timeout = setTimeout(() => setSuccessMsg(""), 4000);
    return () => clearTimeout(timeout);
  }, [successMsg]);

  function handleSaved(message: string) {
    setSuccessMsg(message);
    setEditing(null);
    setFormVersion((version) => version + 1);
    setReloadKey((key) => key + 1);
    // As páginas /product/[slug] ficam em cache no servidor: avisa que mudou.
    void refreshProductsCache();
  }

  function handleEdit(product: Product) {
    setEditing(product);
    setSuccessMsg("");
    // No mobile o formulário fica acima da lista: leva o admin até ele.
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function handleDelete(product: Product) {
    if (!confirm(`Tem certeza que quer apagar "${product.name}"?`)) return;

    const { data, error } = await supabase.from("products").delete().eq("id", product.id).select("id");
    if (error || !data || data.length === 0) {
      alert(`Não deu pra apagar "${product.name}"${error ? `: ${error.message}` : "."}`);
      return;
    }
    if (editing?.id === product.id) setEditing(null);
    setSuccessMsg(`"${product.name}" apagado.`);
    setReloadKey((key) => key + 1);
    void refreshProductsCache();
  }

  return (
    <section aria-label="Produtos">
      {successMsg && (
        <div
          role="status"
          className="mb-6 p-4 bg-wine/20 border border-wine/50 rounded-sm text-fg flex items-center gap-2 font-mono text-sm"
        >
          <CheckCircle2 className="w-5 h-5 text-wine-glow shrink-0" />
          {successMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div ref={formRef} className="lg:col-span-5 scroll-mt-6">
          {/* key: trocar de produto (ou publicar um novo) recria o formulário com os dados certos */}
          <ProductForm
            key={editing ? editing.id : `new-${formVersion}`}
            product={editing}
            onSaved={handleSaved}
            onCancelEdit={() => setEditing(null)}
          />
        </div>

        <div className="lg:col-span-7">
          <h2 className="font-display text-xl font-bold mb-6">{`// PRODUTOS NO SITE (${products.length})`}</h2>
          <ProductList
            products={products}
            editingId={editing?.id ?? null}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      </div>
    </section>
  );
}
