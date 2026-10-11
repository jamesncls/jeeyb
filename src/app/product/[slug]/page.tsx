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
          <div aria-busy="true" className="h-[68svh] lg:h-[max(600px,calc(100svh-5rem))] bg-surface animate-pulse" />
        }
      >
        {params.then(({ slug }) => (
          <ProductView slug={slug} />
        ))}
      </Suspense>
    </StoreShell>
  );
}
