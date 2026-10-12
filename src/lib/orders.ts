import { supabase } from "@/lib/supabase";
import { formatPhone, formatPrice } from "@/lib/format";
import { whatsappLink } from "@/lib/site";
import type { CartItem } from "@/lib/cart-store";
import { CustomerProfile, formatCep, formatCityLine, formatStreetLine } from "@/lib/profile";

// Vai no jsonb `customer` do pedido: é a foto dos dados de entrega na hora da compra.
export interface OrderCustomer {
  name: string;
  // "Cidade / UF"
  location: string;
  // Só dígitos, com DDI (ex: 5547988503312). É o que o admin usa pra chamar o cliente.
  phone: string;
  email?: string;
  cep?: string;
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
}

export function customerFromProfile(profile: CustomerProfile, email?: string): OrderCustomer {
  return {
    name: profile.fullName,
    location: `${profile.city} / ${profile.state}`,
    phone: profile.phone,
    email,
    cep: profile.cep,
    street: profile.street,
    number: profile.number,
    complement: profile.complement || undefined,
    neighborhood: profile.neighborhood,
    city: profile.city,
    state: profile.state,
  };
}

// Endereço em uma linha, pra lista de pedidos do admin. Pedido antigo só tem `location`.
export function formatOrderAddress(customer: Partial<OrderCustomer> | null) {
  if (!customer) return "";
  if (!customer.street) return customer.location ?? "";
  const cep = customer.cep ? ` — CEP ${formatCep(customer.cep)}` : "";
  const complement = customer.complement ? `, ${customer.complement}` : "";
  return `${customer.street}, ${customer.number ?? "s/n"}${complement} — ${customer.neighborhood ?? ""}, ${customer.location ?? ""}${cep}`;
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

export interface OrderDraft {
  id: string;
  // Conta do cliente no Supabase Auth; null quando o pedido sai sem sessão.
  userId: string | null;
  profile: CustomerProfile;
  email?: string;
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

export function buildOrderMessage({ id, profile, items, total }: OrderDraft) {
  const lines = items.map(
    (item) =>
      `- ${item.quantity}x ${item.product.name.trim()} (Tam: ${item.selectedSize}) — ${price(item.product.price * item.quantity)}`
  );

  return [
    "🔥 *NOVO PEDIDO — JEEYB STORE*",
    "",
    `*Pedido:* #${orderCode(id)}`,
    `*Cliente:* ${profile.fullName}`,
    `*WhatsApp:* ${formatPhone(profile.phone)}`,
    `*Endereço:* ${formatStreetLine(profile)}`,
    `*Local:* ${formatCityLine(profile)}`,
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

// Melhor-esforço: se o insert falhar, o checkout segue pelo WhatsApp do mesmo jeito.
export async function saveOrder({ id, userId, profile, email, items, total }: OrderDraft) {
  const row = {
    id,
    customer: customerFromProfile(profile, email),
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
  };

  try {
    // Com sessão, o pedido fica ligado à conta (user_id pro RLS "meus pedidos", customer_id pro perfil).
    const linked = userId ? await supabase.from("orders").insert({ ...row, user_id: userId, customer_id: userId }) : null;
    if (linked && !linked.error) return true;

    // Sem sessão (conta ainda esperando confirmar o e-mail) o RLS recusa o vínculo:
    // salva o pedido só com os dados do cliente.
    const { error } = await supabase.from("orders").insert(row);
    if (error) console.warn("Pedido não foi salvo no Supabase:", error.message);
    return !error;
  } catch (error) {
    console.warn("Pedido não foi salvo no Supabase:", error);
    return false;
  }
}
