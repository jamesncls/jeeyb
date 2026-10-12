import { supabase } from "@/lib/supabase";

const ADMIN_HOME = "/admin";
const STORE_HOME = "/";
// Origem de mentira, só pra o parser de URL dizer se o caminho continua dentro do site.
const INTERNAL_ORIGIN = "http://jeeyb.internal";

function parseInternalPath(next: string | null | undefined): URL | null {
  if (!next || !next.startsWith("/")) return null;
  try {
    const url = new URL(next, INTERNAL_ORIGIN);
    return url.origin === INTERNAL_ORIGIN ? url : null;
  } catch {
    return null;
  }
}

// O ?next= vem da URL, então não dá pra confiar: só passa caminho interno ("/algo").
// Tudo que o navegador leria como outro site ("//site.com", "https://...", barra invertida) vira null.
export function safeNextPath(next: string | null | undefined): string | null {
  const url = parseInternalPath(next);
  // Voltar pro próprio /login seria um loop.
  if (!url || url.pathname === "/login") return null;
  return url.pathname + url.search + url.hash;
}

function isAdminPath(path: string) {
  const pathname = parseInternalPath(path)?.pathname ?? "";
  return pathname === ADMIN_HOME || pathname.startsWith(`${ADMIN_HOME}/`);
}

export interface PostLoginTarget {
  path: string;
  // Admin precisa de navegação completa: o proxy e o servidor leem o cookie de sessão novo.
  admin: boolean;
}

// Pra onde vai quem acabou de logar: admin pro painel, cliente pra home (ou pro ?next= pedido).
// É só conveniência de rota: quem autoriza o /admin continua sendo o servidor (AdminGate) e o RLS.
export async function resolvePostLoginTarget(next: string | null | undefined): Promise<PostLoginTarget> {
  const safeNext = safeNextPath(next);
  const { data: isAdmin } = await supabase.rpc("is_admin");

  if (isAdmin === true) return { path: safeNext ?? ADMIN_HOME, admin: true };
  return { path: safeNext && !isAdminPath(safeNext) ? safeNext : STORE_HOME, admin: false };
}
