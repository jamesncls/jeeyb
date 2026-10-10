# jeeyb — CLAUDE.md

## O que é
Loja online de streetwear (revenda Nike, Jordan, Adidas — tênis, casacos, acessórios).
Fundadores: James & Bruno (daí "jeeyb"). Público 12–40, cena skate/rap/trap/eletrônica.
Estética: **streetwear + futurista, dark premium**. Referências: Kith, Grailed, SSENSE.
V1 = catálogo 100+ produtos, carrinho, login opcional, checkout via WhatsApp. Pagamento online = V2.

## Stack
Next.js 14 App Router · TypeScript · Tailwind · Framer Motion · GSAP + ScrollTrigger · next-intl (pt/en) · Supabase · Zustand · Vercel

## Design System
### Cores (tailwind.config)
- black: #0A0A0A (bg) · surface: #111111 (cards) · surface2: #1A1A1A (hover)
- wine: #6B1D2A (brand/CTA) · wine-light: #8C2F3E (hover) · wine-glow: #A0344A (glows)
- fg: #F5F5F5 · muted: #888888 · line: #262626 (borders)

### Fontes
- Display: Space Grotesk (headlines)
- Body: Inter
- Mono: JetBrains Mono (preços, tags, labels "// DROP 001")

## Regras Visuais
- Bordas 1px #262626; hover → border wine + glow rgba(107,29,42,0.35)
- Grid de fundo sutil (linhas 1px, opacidade 4%)
- Labels mono em caixa alta com `//` ou `[ ]`: "[ NIKE ]", "// NEW IN"
- Cantos: `rounded-sm` (2px). NUNCA `rounded-xl` em cards de produtos.