import Link from "next/link";
import { notFound } from "next/navigation";
import { ShieldCheck, Truck } from "lucide-react";
import { getProductBySlug, getRelatedProducts } from "@/lib/products-server";
import { formatPrice } from "@/lib/format";
import { ProductGallery } from "./ProductGallery";
import { ProductPurchase } from "./ProductPurchase";
import { RelatedProducts } from "./RelatedProducts";

const BENEFITS = [
  { icon: ShieldCheck, title: "100% Autêntico", text: "Só peça original. Réplica não passa pela porta." },
  { icon: Truck, title: "Envio Seguro com Rastreio", text: "Você acompanha o pedido até chegar na sua mão." },
];

export async function ProductView({ slug }: { slug: string }) {
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = await getRelatedProducts({ id: product.id, brand: product.brand, category: product.category });

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16 sm:pb-20">
        <nav aria-label="Você está em" className="mb-6 font-mono text-[11px] uppercase tracking-widest text-muted">
          <Link href="/#shop" className="hover:text-fg transition-colors duration-300">
            ← Catálogo
          </Link>
          <span aria-hidden className="mx-2 text-line">
            /
          </span>
          <span className="text-fg/70">{product.category}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14">
          <ProductGallery images={product.images ?? []} name={product.name} video360Url={product.model_3d_url} />

          <div className="lg:sticky lg:top-28 lg:self-start space-y-8">
            <div>
              <span className="inline-block font-mono text-xs uppercase tracking-widest text-fg bg-surface border border-line px-2.5 py-1 rounded-sm">
                [ {product.brand} ]
              </span>
              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-fg mt-4 leading-[1.08]">
                {product.name}
              </h1>
              <p className="mt-5">
                <span className="block font-mono text-[10px] text-muted uppercase tracking-widest">PREÇO</span>
                <span className="block font-mono font-bold text-3xl sm:text-4xl text-fg">
                  {formatPrice(product.price)}
                </span>
              </p>
            </div>

            <ProductPurchase product={product} />

            {product.description && (
              <section className="bg-surface border border-line rounded-sm p-5 sm:p-6">
                <h2 className="font-mono text-xs text-wine-light uppercase tracking-widest mb-3">{"// DESCRIÇÃO"}</h2>
                <p className="font-sans text-sm sm:text-base text-muted leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </section>
            )}

            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {BENEFITS.map((benefit) => (
                <li key={benefit.title} className="flex items-start gap-3 border border-line rounded-sm p-4">
                  <div className="shrink-0 p-2 bg-wine/15 border border-wine/40 rounded-sm">
                    <benefit.icon className="w-4 h-4 text-wine-glow" aria-hidden />
                  </div>
                  <div>
                    <h3 className="font-mono text-xs text-fg uppercase tracking-wider">{benefit.title}</h3>
                    <p className="font-sans text-xs text-muted mt-1 leading-relaxed">{benefit.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <RelatedProducts products={related} />
    </>
  );
}
