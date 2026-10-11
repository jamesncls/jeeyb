import { notFound } from "next/navigation";
import { getProductBySlug, getRelatedProducts } from "@/lib/products-server";
import { ProductDetail } from "./ProductDetail";

// Busca o produto pelo slug (com cache) e entrega pro layout; produto inexistente vira 404.
export async function ProductView({ slug }: { slug: string }) {
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = await getRelatedProducts({ id: product.id, brand: product.brand, category: product.category });

  return <ProductDetail product={product} related={related} />;
}
