"use server";

import { updateTag } from "next/cache";
import { getAdminSession } from "@/lib/admin-auth";
import { PRODUCTS_CACHE_TAG } from "@/lib/products-server";

// Chamado depois de criar/apagar produto: as páginas /product/[slug] ficam em cache
// no servidor e sem isto só refletiriam a mudança quando o cache expirasse.
export async function refreshProductsCache() {
  const session = await getAdminSession();
  if (session.status !== "admin") return;
  updateTag(PRODUCTS_CACHE_TAG);
}
