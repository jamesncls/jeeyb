import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import type { Product } from "@/lib/supabase";

export const PRODUCTS_CACHE_TAG = "products";
const RELATED_COUNT = 4;

// Leitura pública (anon, sem cookies), então o resultado pode ficar em cache no servidor.
function publicClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  "use cache";
  cacheLife("minutes");
  cacheTag(PRODUCTS_CACHE_TAG);

  const { data, error } = await publicClient().from("products").select("*").eq("slug", slug).maybeSingle();
  if (error) throw new Error(`Falha ao carregar o produto "${slug}": ${error.message}`);
  return data as Product | null;
}

// Mesma marca ou mesma categoria; quem bate nos dois vem primeiro.
export async function getRelatedProducts(product: Pick<Product, "id" | "brand" | "category">): Promise<Product[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag(PRODUCTS_CACHE_TAG);

  const quote = (value: string) => `"${value.replace(/["\\]/g, "\\$&")}"`;
  const { data, error } = await publicClient()
    .from("products")
    .select("*")
    .neq("id", product.id)
    .or(`brand.eq.${quote(product.brand)},category.eq.${quote(product.category)}`)
    .order("created_at", { ascending: false })
    .limit(24);
  if (error) return [];

  const score = (item: Product) =>
    (item.brand === product.brand ? 1 : 0) + (item.category === product.category ? 1 : 0);

  return ((data ?? []) as Product[]).sort((a, b) => score(b) - score(a)).slice(0, RELATED_COUNT);
}
