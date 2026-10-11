import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Cliente do browser: guarda a sessão de auth em cookies, pra o servidor
// (proxy + /admin) enxergar o mesmo login. Sem login, funciona como anon.
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

export interface Product {
  id: string;
  name: string;
  slug: string;
  brand: string;
  category: string;
  price: number;
  sizes: string[];
  colors: string[];
  images: string[];
  description: string;
  featured: boolean;
  // URL pública de um modelo .glb (ex: scan do Polycam) no bucket products.
  model_3d_url?: string | null;
  created_at?: string;
}
