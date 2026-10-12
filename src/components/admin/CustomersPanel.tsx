"use client";

import { useEffect, useState } from "react";
import { MessageCircle, RefreshCw } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { formatPhone, formatPrice } from "@/lib/format";
import { formatCep } from "@/lib/profile";
import { FormError } from "@/components/account/FormError";

interface CustomerRow {
  id: string;
  full_name: string | null;
  phone: string | null;
  address_street: string | null;
  address_number: string | null;
  address_complement: string | null;
  address_neighborhood: string | null;
  address_city: string | null;
  address_state: string | null;
  address_zipcode: string | null;
  created_at: string | null;
}

interface CustomerOrder {
  user_id: string | null;
  customer_id: string | null;
  total: number;
  customer: { email?: string } | null;
}

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });

function formatAddress(customer: CustomerRow) {
  if (!customer.address_street) return "Sem endereço cadastrado";
  const cep = customer.address_zipcode ? ` — CEP ${formatCep(customer.address_zipcode)}` : "";
  const complement = customer.address_complement ? `, ${customer.address_complement}` : "";
  return `${customer.address_street}, ${customer.address_number ?? "s/n"}${complement} — ${customer.address_neighborhood ?? ""}, ${
    customer.address_city ?? ""
  } / ${customer.address_state ?? ""}${cep}`;
}

// Aba de clientes: quem tem conta na loja (tabela profiles), com o resumo de pedidos de cada um.
export function CustomersPanel() {
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    Promise.all([
      supabase
        .from("profiles")
        .select(
          "id, full_name, phone, address_street, address_number, address_complement, address_neighborhood, address_city, address_state, address_zipcode, created_at"
        )
        .order("created_at", { ascending: false }),
      supabase.from("orders").select("user_id, customer_id, total, customer"),
    ]).then(([profiles, customerOrders]) => {
      if (!active) return;
      if (profiles.error) {
        setErrorMsg(`Não deu pra carregar os clientes: ${profiles.error.message}`);
        setStatus("error");
        return;
      }
      setCustomers((profiles.data ?? []) as CustomerRow[]);
      // Sem os pedidos a lista ainda serve: só fica sem o resumo de compras.
      setOrders((customerOrders.data ?? []) as CustomerOrder[]);
      setErrorMsg("");
      setStatus("ready");
    });
    return () => {
      active = false;
    };
  }, [reloadKey]);

  return (
    <section aria-label="Clientes">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h2 className="font-display text-xl font-bold">{`// CLIENTES (${customers.length})`}</h2>
          <p className="font-mono text-xs text-muted mt-1">CONTAS COM PERFIL · MAIS RECENTES PRIMEIRO</p>
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

      <div className="mb-6">
        <FormError message={errorMsg} />
      </div>

      {status === "loading" && customers.length === 0 && (
        <div className="p-12 border border-line text-center font-mono text-muted text-sm rounded-sm animate-pulse">
          {"// CARREGANDO CLIENTES..."}
        </div>
      )}

      {status === "ready" && customers.length <= 1 && (
        <div className="mb-4 p-4 border border-line text-center font-mono text-muted text-xs leading-relaxed rounded-sm">
          {customers.length === 0 ? "Nenhum cliente com perfil ainda. " : ""}
          Se já existem clientes cadastrados e eles não aparecem aqui, falta a policy que deixa o admin ler a tabela
          profiles: rode o supabase/profiles-policies.sql.
        </div>
      )}

      <ul className="space-y-3">
        {customers.map((customer) => {
          const own = orders.filter((order) => order.user_id === customer.id || order.customer_id === customer.id);
          const spent = own.reduce((sum, order) => sum + Number(order.total), 0);
          const email = own.find((order) => order.customer?.email)?.customer?.email;
          const phone = customer.phone?.replace(/\D/g, "");

          return (
            <li
              key={customer.id}
              className="bg-surface border border-line rounded-sm p-4 sm:p-5 grid grid-cols-1 md:grid-cols-12 gap-4 md:items-center"
            >
              <div className="md:col-span-4 min-w-0">
                <p className="font-display font-bold text-sm text-fg break-words">
                  {customer.full_name || "Sem nome"}
                </p>
                <p className="font-mono text-xs text-muted mt-1 break-all">
                  {phone ? formatPhone(phone) : "Sem WhatsApp"}
                  {email && ` · ${email}`}
                </p>
              </div>

              <p className="md:col-span-4 min-w-0 font-mono text-xs text-muted leading-relaxed break-words">
                {formatAddress(customer)}
              </p>

              <div className="md:col-span-2 font-mono text-xs">
                <span className="block text-[10px] text-muted uppercase tracking-widest">PEDIDOS</span>
                <span className="block text-fg">
                  {own.length} · {formatPrice(spent)}
                </span>
                {customer.created_at && (
                  <span className="block text-[10px] text-muted mt-1">
                    desde {dateFormatter.format(new Date(customer.created_at))}
                  </span>
                )}
              </div>

              <div className="md:col-span-2 md:text-right">
                {phone ? (
                  <a
                    href={`https://wa.me/${phone}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-fg border border-line hover:border-wine hover:shadow-wine-glow px-3 py-2 rounded-sm transition-all duration-300"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    WhatsApp
                  </a>
                ) : (
                  <span className="font-mono text-[10px] text-muted uppercase tracking-widest">[ SEM CONTATO ]</span>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
