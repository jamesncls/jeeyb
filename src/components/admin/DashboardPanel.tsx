"use client";

import { useEffect, useState } from "react";
import { Banknote, Package, Receipt, RefreshCw, Users } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { formatPrice } from "@/lib/format";
import { ORDER_STATUSES, ORDER_STATUS_LABELS, OrderStatus } from "@/lib/orders";
import { FormError } from "@/components/account/FormError";
import { StatCard } from "./StatCard";

// Regra da receita: só conta pedido que saiu de "pendente" (o cliente fechou com a loja no WhatsApp).
// Pendente é intenção de compra; se um status de cancelado for criado no banco, ele fica de fora também.
const REVENUE_STATUSES: OrderStatus[] = ["confirmed", "shipped", "delivered"];

interface OrderSummary {
  total: number;
  status: OrderStatus;
}

interface DashboardData {
  orders: OrderSummary[];
  // null quando a contagem de clientes não pôde ser lida.
  customers: number | null;
}

// Aba de visão geral: receita, pedidos, ticket médio e clientes, calculados das tabelas orders e profiles.
export function DashboardPanel() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    Promise.all([
      supabase.from("orders").select("total, status"),
      supabase.from("profiles").select("id", { count: "exact", head: true }),
    ]).then(([orders, profiles]) => {
      if (!active) return;
      setLoading(false);
      if (orders.error) {
        setErrorMsg(`Não deu pra carregar os pedidos: ${orders.error.message}`);
        return;
      }
      setErrorMsg("");
      setData({
        orders: (orders.data ?? []) as OrderSummary[],
        customers: profiles.error ? null : (profiles.count ?? 0),
      });
    });
    return () => {
      active = false;
    };
  }, [reloadKey]);

  const orders = data?.orders ?? [];
  const paid = orders.filter((order) => REVENUE_STATUSES.includes(order.status));
  const pending = orders.filter((order) => order.status === "pending");
  const revenue = paid.reduce((sum, order) => sum + Number(order.total), 0);
  const pendingValue = pending.reduce((sum, order) => sum + Number(order.total), 0);
  const averageTicket = paid.length > 0 ? revenue / paid.length : 0;

  return (
    <section aria-label="Dashboard financeiro">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h2 className="font-display text-xl font-bold">{"// DASHBOARD FINANCEIRO"}</h2>
          <p className="font-mono text-xs text-muted mt-1">
            RECEITA = PEDIDOS CONFIRMADOS, ENVIADOS E ENTREGUES · PENDENTE NÃO ENTRA
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setLoading(true);
            setReloadKey((key) => key + 1);
          }}
          disabled={loading}
          className="self-start inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-fg border border-line hover:border-wine hover:shadow-wine-glow px-4 py-2 rounded-sm transition-all duration-300 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Atualizar
        </button>
      </div>

      <div className="mb-6">
        <FormError message={errorMsg} />
      </div>

      <div className={`grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 ${loading && !data ? "animate-pulse" : ""}`}>
        <StatCard
          icon={Banknote}
          label="Receita total"
          value={formatPrice(revenue)}
          hint={`${paid.length} pedido(s) fechado(s)`}
          highlight
        />
        <StatCard
          icon={Package}
          label="Pedidos realizados"
          value={String(orders.length)}
          hint={`${pending.length} pendente(s) · ${formatPrice(pendingValue)} a confirmar`}
        />
        <StatCard
          icon={Receipt}
          label="Ticket médio"
          value={formatPrice(averageTicket)}
          hint="Receita ÷ pedidos fechados"
        />
        <StatCard
          icon={Users}
          label="Clientes cadastrados"
          value={data?.customers == null ? "—" : String(data.customers)}
          hint={data && data.customers == null ? "Não deu pra ler a tabela profiles" : "Contas com perfil na loja"}
        />
      </div>

      {/* Funil por status */}
      <div className="mt-8 bg-surface border border-line rounded-sm p-5 sm:p-6">
        <h3 className="font-mono text-xs text-wine-light uppercase tracking-widest mb-5">{"// PEDIDOS POR STATUS"}</h3>
        <ul className="space-y-4">
          {ORDER_STATUSES.map((status) => {
            const matching = orders.filter((order) => order.status === status);
            const value = matching.reduce((sum, order) => sum + Number(order.total), 0);
            const share = orders.length > 0 ? matching.length / orders.length : 0;
            return (
              <li key={status}>
                <div className="flex items-baseline justify-between gap-3 font-mono text-xs">
                  <span className="text-fg uppercase tracking-wider">{ORDER_STATUS_LABELS[status]}</span>
                  <span className="text-muted">
                    {matching.length} · {formatPrice(value)}
                  </span>
                </div>
                <div className="mt-2 h-1 bg-background border border-line/60 overflow-hidden">
                  <div
                    className={`h-full origin-left transition-transform duration-500 ${
                      status === "pending" ? "bg-muted" : "bg-wine-glow"
                    }`}
                    style={{ transform: `scaleX(${share})` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
