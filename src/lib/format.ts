// Sem hooks nem cliente Supabase: pode ser importado de Server e Client Components.
export function formatPrice(price: number) {
  return price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// "(47) 98850-3312" → "5547988503312". Devolve null se não parecer um celular/fixo BR com DDD.
export function normalizePhone(input: string) {
  const digits = input.replace(/\D/g, "").replace(/^0+/, "");
  if (digits.length === 10 || digits.length === 11) return `55${digits}`;
  if ((digits.length === 12 || digits.length === 13) && digits.startsWith("55")) return digits;
  return null;
}

// "5547988503312" → "+55 47 98850-3312"
export function formatPhone(phone: string) {
  const match = phone.match(/^(\d{2})(\d{2})(\d{4,5})(\d{4})$/);
  return match ? `+${match[1]} ${match[2]} ${match[3]}-${match[4]}` : phone;
}
