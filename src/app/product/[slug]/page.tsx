import { Suspense } from "react";
import type { Metadata } from "next";
import { StoreShell } from "@/components/layout/StoreShell";
import { ProductView } from "@/components/product/ProductView";
import { getProductBySlug } from "@/lib/products-server";
import { formatPrice } from "@/lib/format";

type ProductPageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return { title: "Produto não encontrado — jeeyb", robots: { index: false } };
  }

  const title = `${product.name.trim()} — jeeyb`;
  const description =
    product.description?.trim() ||
    `${product.name.trim()} (${product.brand}) por ${formatPrice(product.price)}. Peça original, com a curadoria da jeeyb.`;
  const image = product.images?.[0];

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      siteName: "jeeyb",
      locale: "pt_BR",
      images: image ? [{ url: image, alt: product.name.trim() }] : undefined,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default function ProductPage({ params }: ProductPageProps) {
  return (
    <StoreShell>
      {/* Sem generateStaticParams o slug só existe na request: precisa de Suspense (Cache Components). */}
      <Suspense
        fallback={
          <div
            aria-busy="true"
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 animate-pulse"
          >
            <div className="aspect-square bg-surface border border-line rounded-sm" />
            <div className="space-y-5">
              <div className="h-6 w-24 bg-surface" />
              <div className="h-12 w-4/5 bg-surface" />
              <div className="h-10 w-40 bg-surface" />
              <div className="h-40 bg-surface" />
            </div>
          </div>
        }
      >
        {params.then(({ slug }) => (
          <ProductView slug={slug} />
        ))}
      </Suspense>
    </StoreShell>
  );
}
