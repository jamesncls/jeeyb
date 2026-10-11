import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin-auth";
import { AdminPanel } from "./AdminPanel";

// Server Component: só entrega o painel pra quem está logado E é admin.
export async function AdminGate() {
  const session = await getAdminSession();

  if (session.status === "anonymous") redirect("/admin/login");
  if (session.status === "forbidden") redirect("/admin/login?erro=sem-permissao");

  return <AdminPanel adminEmail={session.email} />;
}
