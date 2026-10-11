import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

// Cliente por request, com a sessão lida dos cookies. Usa a anon key: quem
// decide o que o usuário pode fazer é o RLS, nunca a service_role.
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // Server Components não podem gravar cookies; o refresh da sessão
            // é gravado pelo src/proxy.ts.
          }
        },
      },
    }
  );
}
