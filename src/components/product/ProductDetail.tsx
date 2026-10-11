import Link from "next/link";
import { PackageCheck, Radar, ShieldCheck } from "lucide-react";
import type { Product } from "@/lib/supabase";
import { formatPrice } from "@/lib/format";
import { Reveal } from "@/components/ui/Reveal";
import { BrandLogo } from "./BrandLogo";
import { ProductScene } from "./ProductScene";
import { ProductPurchase } from "./ProductPurchase";
import { RelatedProducts } from "./RelatedProducts";

const TRUST_SEALS = [
  { icon: ShieldCheck, label: "100% Autêntico" },
  { icon: PackageCheck, label: "Envio Segurado" },
  { icon: Radar, label: "Rastreio Express" },
];

// Sem caixas atrás do texto: a legibilidade vem da sombra das letras e do gradiente do fundo (ProductScene).
const TEXT_SHADOW = "[text-shadow:0_1px_12px_rgba(0,0,0,0.9)]";

// Conteúdo da página de produto. A cena (fundo contínuo + produto na esquerda) é o ProductScene;
// aqui ficam o "← Catálogo" e a coluna de informações que flutua na direita, sem caixas.
export function ProductDetail({ product, related }: { product: Product; related: Product[] }) {
  return (
    <>
      <ProductScene
        images={product.images ?? []}
        name={product.name}
        video360Url={product.model_3d_url}
        breadcrumb={
          // Sem cor própria: herda a da cena (clara sobre fundo escuro, escura sobre foto de fundo claro).
          <nav aria-label="Você está em" className="font-mono text-[11px] uppercase tracking-widest">
            <Link href="/#shop" className="opacity-70 hover:opacity-100 transition-opacity duration-300">
              ← Catálogo
            </Link>
            <span aria-hidden className="mx-2 opacity-30">
              /
            </span>
            <span className="opacity-70">{product.category}</span>
          </nav>
        }
      >
        <div className={`w-full max-w-xl space-y-8 ${TEXT_SHADOW}`}>
          <Reveal className="space-y-5">
            {/* Só o logo da marca, alinhado à esquerda */}
            <BrandLogo
              brand={product.brand}
              className="block w-14 h-14 text-fg drop-shadow-[0_1px_8px_rgba(0,0,0,0.8)]"
            />

            {/* Linha 2: tira do modelo */}
            <div>
              <div aria-hidden className="h-px bg-linear-to-r from-wine-glow via-fg/20 to-transparent" />
              <h1 className="font-display font-bold uppercase tracking-tight text-fg text-4xl sm:text-5xl xl:text-6xl leading-[0.95] py-4 break-words">
                {product.name}
              </h1>
              <div aria-hidden className="h-px bg-linear-to-r from-wine-glow via-fg/20 to-transparent" />
            </div>

            {/* Linha 3: preço + condição */}
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <span className="font-mono font-bold text-4xl sm:text-5xl text-fg [text-shadow:0_0_28px_rgba(160,52,74,0.9),0_1px_12px_rgba(0,0,0,0.9)]">
                {formatPrice(product.price)}
              </span>
              <span className="font-mono text-xs uppercase tracking-widest text-fg/70">Em até 12x no cartão</span>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <ProductPurchase product={product} />
          </Reveal>

          <Reveal delay={0.2} className="space-y-6">
            <ul className="flex flex-wrap gap-x-6 gap-y-3">
              {TRUST_SEALS.map((seal) => (
                <li
                  key={seal.label}
                  className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-fg/85"
                >
                  <seal.icon className="w-4 h-4 text-wine-glow" aria-hidden />
                  {seal.label}
                </li>
              ))}
            </ul>

            {product.description && (
              <p className="font-sans text-sm text-fg/70 leading-relaxed whitespace-pre-line max-w-md">
                {product.description}
              </p>
            )}
          </Reveal>
        </div>
      </ProductScene>

      <RelatedProducts products={related} />
    </>
  );
}
