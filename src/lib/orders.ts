import { supabase } from "@/lib/supabase";
import { formatPrice } from "@/lib/format";
import { whatsappLink } from "@/lib/site";
import type { CartItem } from "@/lib/cart-store";

export interface OrderCustomer {
  name: string;
  location: string;
  // Só dígitos, com DDI (ex: 5547988503312). É o que o admin usa pra chamar o cliente.
  phone: string;
}

export const ORDER_STATUSES = ["pending", "confirmed", "shipped", "delivered"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pendente",
  confirmed: "Confirmado",
  shipped: "Enviado",
  delivered: "Entregue",
};

export interface OrderItem {
  product_id: string;
  name: string;
  brand: string;
  size: string;
  quantity: number;
  unit_price: number;
}

// Linha da tabela public.orders (pedidos antigos podem não ter phone).
export interface Order {
  id: string;
  user_id: string | null;
  customer: Partial<OrderCustomer> | null;
  items: OrderItem[] | null;
  total: number;
  status: OrderStatus;
  created_at: string;
}

// "(47) 98850-3312" → "5547988503312". Devolve null se não parecer um celular/fixo BR com DDD.
export function normalizePhone(input: string) {
  const digits = input.replace(/\D/g, "").replace(/^0+/, "");
  if (digits.length === 10 || digits.length === 11) return `55${digits}`;
  if ((digits.length === 12 || digits.length === 13) && digits.startsWith("55")) return digits;
  return null;
}

export interface OrderDraft {
  id: string;
  customer: OrderCustomer;
  items: CartItem[];
  total: number;
}

export function createOrderId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  // Fallback pra contexto não seguro (http em IP da rede local).
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
    const random = Math.floor(Math.random() * 16);
    return (char === "x" ? random : (random % 4) + 8).toString(16);
  });
}

// Código curto que vai na mensagem e bate com o id salvo no Supabase.
export function orderCode(id: string) {
  return id.slice(0, 8).toUpperCase();
}

// toLocaleString usa espaço não separável depois do "R$"; no WhatsApp vai espaço normal.
const price = (value: number) => formatPrice(value).replace(/ /g, " ");

export function buildOrderMessage({ id, customer, items, total }: OrderDraft) {
  const lines = items.map(
    (item) =>
      `- ${item.quantity}x ${item.product.name.trim()} (Tam: ${item.selectedSize}) — ${price(item.product.price * item.quantity)}`
  );

  return [
    "🔥 *NOVO PEDIDO — JEEYB STORE*",
    "",
    `*Pedido:* #${orderCode(id)}`,
    `*Cliente:* ${customer.name}`,
    `*Local:* ${customer.location}`,
    "",
    "*ITENS DO PEDIDO:*",
    ...lines,
    "",
    `*TOTAL:* ${price(total)}`,
  ].join("\n");
}

export function orderWhatsAppLink(order: OrderDraft) {
  return whatsappLink(buildOrderMessage(order));
}

// Melhor-esforço: se a tabela não existir ou o insert falhar, o checkout segue pelo WhatsApp.
export async function saveOrder({ id, customer, items, total }: OrderDraft) {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const { error } = await supabase.from("orders").insert({
      id,
      user_id: session?.user.id ?? null,
      customer,
      items: items.map((item) => ({
        product_id: item.product.id,
        name: item.product.name.trim(),
        brand: item.product.brand,
        size: item.selectedSize,
        quantity: item.quantity,
        unit_price: item.product.price,
      })),
      total,
      status: "pending",
    });

    if (error) console.warn("Pedido não foi salvo no Supabase:", error.message);
    return !error;
  } catch (error) {
    console.warn("Pedido não foi salvo no Supabase:", error);
    return false;
  }
}
