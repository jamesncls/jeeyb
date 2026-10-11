// Contatos e links da loja, usados por navbar, cards e footer.
export const WHATSAPP_NUMBER = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "5547988503312").replace(/\D/g, "");

// Opcional: defina NEXT_PUBLIC_INSTAGRAM_URL no .env.local pra o link aparecer no footer.
export const INSTAGRAM_URL = process.env.NEXT_PUBLIC_INSTAGRAM_URL || "";

export const NAV_LINKS = [
  { href: "/#shop", label: "// CATÁLOGO" },
  { href: "/#drops", label: "// DROPS" },
  { href: "/#sobre", label: "// SOBRE" },
  { href: "/admin", label: "// ADMIN" },
];

// Vídeos de fundo da hero, na ordem do carrossel. Os arquivos ficam em public/videos/.
// Arquivo que ainda não existe é ignorado: as setas e os indicadores só aparecem com 2+ vídeos no ar.
export const HERO_VIDEOS = ["/videos/hero-sneaker.mp4", "/videos/hero-jacket.mp4"];

export function whatsappLink(message?: string) {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
