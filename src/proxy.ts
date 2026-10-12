import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Roda antes de qualquer rota /admin: renova a sessão do Supabase nos cookies e
// manda quem não está logado pro login único da loja (/login). A checagem de admin
// fica no servidor (AdminGate) e no banco (RLS); isto aqui é só o primeiro filtro.
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
          Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
        },
      },
    }
  );

  const { data } = await supabase.auth.getClaims();
  const { pathname, search } = request.nextUrl;

  // Redireciona levando junto os cookies de sessão que o Supabase acabou de renovar.
  function redirectToLogin(next?: string) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.search = "";
    if (next) loginUrl.searchParams.set("next", next);

    const redirectResponse = NextResponse.redirect(loginUrl);
    response.cookies.getAll().forEach((cookie) => redirectResponse.cookies.set(cookie));
    return redirectResponse;
  }

  // Endereço antigo do login de admin (favoritos, links salvos): hoje o login é um só.
  if (pathname === "/admin/login") return redirectToLogin();

  if (!data?.claims) return redirectToLogin(pathname + search);

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
