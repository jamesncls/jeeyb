"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, MessageCircle, RefreshCw } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { formatPrice } from "@/lib/format";
import { ORDER_STATUSES, ORDER_STATUS_LABELS, Order, OrderStatus, orderCode } from "@/lib/orders";

const STATUS_STYLES: Record<OrderStatus, string> = {
  pending: "border-wine-glow text-wine-glow",
  confirmed: "border-fg/60 text-fg",
  shipped: "border-fg/60 text-fg",
  delivered: "border-line text-muted",
};

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

// 5547988503312 → +55 47 98850-3312
function formatPhone(phone: string) {
  const match = phone.match(/^(\d{2})(\d{2})(\d{4,5})(\d{4})$/);
  return match ? `+${match[1]} ${match[2]} ${match[3]}-${match[4]}` : phone;
}

function customerWhatsAppLink(order: Order) {
  const phone = order.customer?.phone?.replace(/\D/g, "");
  if (!phone) return null;
  const firstName = order.customer?.name?.trim().split(/\s+/)[0];
  const message = `Fala${firstName ? `, ${firstName}` : ""}! Aqui é da jeeyb, sobre o seu pedido #${orderCode(order.id)}.`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export function OrdersPanel() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);

  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (!active) return;
        if (error) {
          setErrorMsg(
            error.code === "PGRST205"
              ? "A tabela orders ainda não existe. Rode o supabase/orders.sql no SQL Editor do Supabase."
              : `Não deu pra carregar os pedidos: ${error.message}`
          );
          setStatus("error");
          return;
        }
        setOrders((data ?? []) as Order[]);
        setErrorMsg("");
        setStatus("ready");
      });
    return () => {
      active = false;
    };
  }, [reloadKey]);

  async function handleStatusChange(order: Order, nextStatus: OrderStatus) {
    if (nextStatus === order.status) return;
    setSavingId(order.id);
    setErrorMsg("");

    // .select() confirma que a linha mudou: com RLS, um update negado não devolve erro, só zero linhas.
    const { data, error } = await supabase
      .from("orders")
      .update({ status: nextStatus })
      .eq("id", order.id)
      .select("id");

    if (error || !data || data.length === 0) {
      setErrorMsg(
        `Não deu pra mudar o status do pedido #${orderCode(order.id)}${error ? `: ${error.message}` : ". Confere se sua conta ainda é admin."}`
      );
    } else {
      setOrders((current) => current.map((item) => (item.id === order.id ? { ...item, status: nextStatus } : item)));
    }
    setSavingId(null);
  }

  const pendingCount = orders.filter((order) => order.status === "pending").length;

  return (
    <section aria-label="Pedidos">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h2 className="font-display text-xl font-bold">{`// PEDIDOS (${orders.length})`}</h2>
          <p className="font-mono text-xs text-muted mt-1">
            {pendingCount} PENDENTE(S) · MAIS RECENTES PRIMEIRO
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setStatus("loading");
            setReloadKey((key) => key + 1);
          }}
          disabled={status === "loading"}
          className="self-start inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-fg border border-line hover:border-wine hover:shadow-wine-glow px-4 py-2 rounded-sm transition-all duration-300 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${status === "loading" ? "animate-spin" : ""}`} />
          Atualizar
        </button>
      </div>

      {errorMsg && (
        <div
          role="alert"
          className="mb-6 p-4 bg-wine/20 border border-wine/50 rounded-sm text-fg flex items-start gap-2 font-mono text-xs leading-relaxed"
        >
          <AlertTriangle className="w-4 h-4 text-wine-glow shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {status === "loading" && orders.length === 0 && (
        <div className="p-12 border border-line text-center font-mono text-muted text-sm rounded-sm animate-pulse">
          {"// CARREGANDO PEDIDOS..."}
        </div>
      )}

      {status === "ready" && orders.length === 0 && (
        <div className="p-12 border border-line text-center font-mono text-muted text-sm rounded-sm">
          Nenhum pedido ainda. Quando alguém finalizar pelo carrinho, aparece aqui.
        </div>
      )}

      <ul className="space-y-4">
        {orders.map((order) => {
          const whatsappUrl = customerWhatsAppLink(order);
          const items = order.items ?? [];

          return (
            <li key={order.id} className="bg-surface border border-line rounded-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-4 sm:px-5 py-4 border-b border-line">
                <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                  <span className="font-mono font-bold text-base text-fg">#{orderCode(order.id)}</span>
                  <time dateTime={order.created_at} className="font-mono text-xs text-muted">
                    {dateFormatter.format(new Date(order.created_at))}
                  </time>
                </div>

                <label className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-muted uppercase tracking-widest">STATUS</span>
                  <select
                    value={order.status}
                    disabled={savingId === order.id}
                    onChange={(e) => handleStatusChange(order, e.target.value as OrderStatus)}
                    className={`bg-background border px-3 py-2 font-mono text-xs uppercase tracking-wider rounded-sm outline-none focus:border-wine transition-colors duration-300 disabled:opacity-50 ${
                      STATUS_STYLES[order.status] ?? "border-line text-fg"
                    }`}
                  >
                    {ORDER_STATUSES.map((option) => (
                      <option key={option} value={option} className="bg-background text-fg">
                        {ORDER_STATUS_LABELS[option]} ({option})
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 px-4 sm:px-5 py-4">
                <div className="md:col-span-4 min-w-0">
                  <span className="block font-mono text-[10px] text-muted uppercase tracking-widest mb-1">
                    {"// CLIENTE"}
                  </span>
                  <p className="font-display font-bold text-sm text-fg break-words">
                    {order.customer?.name || "Sem nome"}
                  </p>
                  <p className="font-mono text-xs text-muted mt-1 break-words">
                    {order.customer?.phone ? formatPhone(order.customer.phone) : "Sem WhatsApp"}
                    {" · "}
                    {order.customer?.location || "Sem local"}
                  </p>
                </div>

                <div className="md:col-span-5 min-w-0">
                  <span className="block font-mono text-[10px] text-muted uppercase tracking-widest mb-1">
                    {"// ITENS"}
                  </span>
                  <ul className="space-y-1">
                    {items.length === 0 && <li className="font-mono text-xs text-muted">Sem itens registrados</li>}
                    {items.map((item, index) => (
                      <li key={index} className="flex justify-between gap-3 font-mono text-xs text-fg">
                        <span className="min-w-0 break-words">
                          {item.quantity}x {item.name} <span className="text-muted">(Tam: {item.size})</span>
                        </span>
                        <span className="shrink-0 text-muted">{formatPrice(item.unit_price * item.quantity)}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="md:col-span-3 flex flex-row md:flex-col items-center md:items-end justify-between gap-3">
                  <div className="md:text-right">
                    <span className="block font-mono text-[10px] text-muted uppercase tracking-widest">TOTAL</span>
                    <span className="block font-mono font-bold text-lg text-fg">{formatPrice(Number(order.total))}</span>
                  </div>

                  {whatsappUrl ? (
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-wine hover:bg-wine-light text-white font-mono text-xs uppercase tracking-wider px-4 py-2.5 rounded-sm transition-colors duration-300"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      Falar no WhatsApp
                    </a>
                  ) : (
                    <span className="font-mono text-[10px] text-muted uppercase tracking-widest border border-line px-3 py-2 rounded-sm">
                      [ SEM WHATSAPP NO PEDIDO ]
                    </span>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
