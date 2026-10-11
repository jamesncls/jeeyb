// Sem hooks nem cliente Supabase: pode ser importado de Server e Client Components.
export function formatPrice(price: number) {
  return price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
