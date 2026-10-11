import { supabase } from "@/lib/supabase";
import { formatPrice } from "@/lib/products";
import { whatsappLink } from "@/lib/site";
import type { CartItem } from "@/lib/cart-store";

export interface OrderCustomer {
  name: string;
  location: string;
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
