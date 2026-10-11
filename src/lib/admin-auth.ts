import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export type AdminSession =
  | { status: "anonymous" }
  | { status: "forbidden" }
  | { status: "admin"; email: string };

export async function getAdminSession(): Promise<AdminSession> {
  const supabase = await createSupabaseServerClient();

  // getUser() valida o token no servidor de Auth; o cookie sozinho não é confiável.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: "anonymous" };

  const { data: isAdmin, error } = await supabase.rpc("is_admin");
  if (error || isAdmin !== true) return { status: "forbidden" };

  return { status: "admin", email: user.email ?? "" };
}
