import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin-auth";
import { AdminPanel } from "./AdminPanel";

// Server Component: só entrega o painel pra quem está logado E é admin.
export async function AdminGate() {
  const session = await getAdminSession();

  if (session.status === "anonymous") redirect("/login?next=/admin");
  // Cliente logado tentando abrir o painel: volta pra loja sem aviso (não revela que o painel existe).
  if (session.status === "forbidden") redirect("/");

  return <AdminPanel adminEmail={session.email} />;
}
