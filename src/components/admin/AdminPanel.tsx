"use client";

import { useState } from "react";
import Link from "next/link";
import { LogOut } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { DashboardPanel } from "./DashboardPanel";
import { ProductsPanel } from "./ProductsPanel";
import { OrdersPanel } from "./OrdersPanel";
import { CustomersPanel } from "./CustomersPanel";

const TABS = [
  { id: "dashboard", label: "📊 DASHBOARD" },
  { id: "products", label: "👟 PRODUTOS" },
  { id: "orders", label: "📦 PEDIDOS" },
  { id: "customers", label: "👥 CLIENTES" },
] as const;
type AdminTab = (typeof TABS)[number]["id"];

// Casca do painel admin: cabeçalho, abas e logout. Cada aba é um componente próprio, que busca
// os dados dele; quem autoriza tudo continua sendo o servidor (AdminGate) e o RLS (is_admin).
export function AdminPanel({ adminEmail }: { adminEmail: string }) {
  const [tab, setTab] = useState<AdminTab>("dashboard");
  // Depois de aberta, a aba de produtos fica montada (só escondida): trocar de aba não perde
  // um cadastro ou edição pela metade. As outras remontam a cada visita, com dados frescos.
  const [productsOpened, setProductsOpened] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  async function handleLogout() {
    setSigningOut(true);
    await supabase.auth.signOut();
    // Navegação completa: passa pelo proxy de novo, já sem a sessão.
    window.location.assign("/admin/login");
  }

  return (
    <div className="min-h-screen bg-background text-fg p-4 sm:p-10 font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-line pb-6 mb-6">
          <div>
            <span className="font-mono text-xs text-wine-light tracking-widest">{"// MANAGEMENT HUB"}</span>
            <h1 className="font-display text-3xl font-bold">Painel Admin — jeeyb</h1>
            <p className="font-mono text-xs text-muted mt-1 break-all">[ ADMIN ] {adminEmail}</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="font-mono text-xs text-muted hover:text-fg border border-line hover:border-wine/60 px-4 py-2 rounded-sm transition-colors"
            >
              ← Voltar para a Loja
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              disabled={signingOut}
              className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-fg border border-line hover:border-wine hover:shadow-wine-glow px-4 py-2 rounded-sm transition-all duration-300 disabled:opacity-50"
            >
              <LogOut className="w-3.5 h-3.5" />
              {signingOut ? "SAINDO..." : "SAIR / LOGOUT"}
            </button>
          </div>
        </header>

        <nav
          role="tablist"
          aria-label="Seções do painel"
          className="sticky top-0 z-20 -mx-4 px-4 sm:mx-0 sm:px-0 py-3 mb-8 flex gap-2 overflow-x-auto bg-background/90 backdrop-blur-md border-b border-line/60 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {TABS.map((item) => {
            const active = item.id === tab;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                id={`admin-tab-${item.id}`}
                aria-selected={active}
                aria-controls="admin-tabpanel"
                onClick={() => {
                  setTab(item.id);
                  if (item.id === "products") setProductsOpened(true);
                }}
                className={`shrink-0 font-mono text-xs uppercase tracking-wider px-4 py-2.5 rounded-sm border transition-all duration-300 ${
                  active
                    ? "border-wine bg-wine/20 text-fg shadow-wine-subtle"
                    : "border-line bg-surface text-muted hover:border-wine/60 hover:text-fg"
                }`}
              >
                [ {item.label} ]
              </button>
            );
          })}
        </nav>

        <div id="admin-tabpanel" role="tabpanel" aria-labelledby={`admin-tab-${tab}`}>
          {tab === "dashboard" && <DashboardPanel />}
          {productsOpened && (
            <div hidden={tab !== "products"}>
              <ProductsPanel />
            </div>
          )}
          {tab === "orders" && <OrdersPanel />}
          {tab === "customers" && <CustomersPanel />}
        </div>
      </div>
    </div>
  );
}
