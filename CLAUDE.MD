# jeeyb — CLAUDE.md

## O que é
Loja online de streetwear (revenda Nike, Jordan, Adidas — tênis, casacos, acessórios).
Fundadores: James & Bruno (daí "jeeyb"). Público 12–40, cena skate/rap/trap/eletrônica.
Estética: **streetwear + futurista, dark premium**. Referências: Kith, Grailed, SSENSE.
V1 = catálogo 100+ produtos, carrinho, login opcional, checkout via WhatsApp. Pagamento online = V2.

## Stack (não trocar sem perguntar)
Next.js 16.4 App Router (Turbopack) · TypeScript · Tailwind CSS v4 · Framer Motion (micro-interações, page transitions)
GSAP + ScrollTrigger (scroll reveals, parallax) · next-intl (pt/en) · Supabase (auth + orders)
Zustand (carrinho, persistido em localStorage) · Vercel
- Next 16 tem breaking changes: ler o guia em node_modules/next/dist/docs/ antes de mexer em config/APIs (ver AGENTS.md)

### Tailwind v4 (pipeline de CSS)
- PostCSS: postcss.config.mjs só com o plugin `@tailwindcss/postcss`. Sem loader de CSS no next.config.ts
- src/app/globals.css começa com `@import "tailwindcss"` e guarda os tokens da marca no bloco `@theme`
- NÃO criar tailwind.config.ts nem usar `@tailwind base/components/utilities` (sintaxe v3). Token novo → entra no `@theme`
- CSS global próprio vai dentro de `@layer base` (no v4, CSS fora de layer vence as utilities)

## Design System
### Cores (src/app/globals.css → `@theme`, como `--color-*`)
- background: #0A0A0A (bg) · surface: #111111 (cards) · surface2: #1A1A1A (hover)
- wine: #6B1D2A (brand/CTA) · wine-light: #8C2F3E (hover) · wine-glow: #A0344A (glows)
- fg: #F5F5F5 · muted: #888888 · line: #262626 (borders)
- Sombras: shadow-wine-glow (0 0 24px) · shadow-wine-subtle (0 0 12px)
### Fontes (next/font em layout.tsx → `@theme inline`)
- font-display: Space Grotesk (headlines, lowercase, tracking-tight)
- font-sans: Inter (body) · font-mono: JetBrains Mono (preços, tags, labels tipo "// DROP 001")
### Linguagem visual futurista
- Bordas 1px #262626; no hover → border wine + box-shadow 0 0 24px rgba(107,29,42,.35)
- Grid de fundo sutil (linhas 1px, opacidade 4%) em seções hero/about
- Noise/grain overlay (opacity .04) global via pseudo-element
- Labels mono em caixa alta com `//` ou `[ ]`: "[ NIKE ]", "// NEW IN"
- Cantos: rounded-sm (2px, fixado via `--radius-sm` no `@theme`) ou nenhum. NUNCA rounded-xl/full em cards (só em avatar/botão pill de tag)
- Transições: 300–500ms, ease [0.22,1,0.36,1]
### Tom de voz (copy)
Direto, sem frescura. Gíria streetwear natural: drop, grail, cop, heat. PT-BR com inglês onde é natural.
Headline hero PT: "seu próximo grail tá aqui." / EN: "your next grail is here."

## Animações (regras)
- Hero: vídeo <video autoPlay muted loop playsInline> + overlay gradiente + headline com reveal letra a letra (Framer)
- Product cards: entrada com GSAP ScrollTrigger stagger (y:40→0, opacity, 0.08s entre cards), batch mode
- Hover card: scale 1.02 na imagem, troca pra 2ª foto se existir, glow wine na borda
- Page transitions: fade+slide curto (200ms) via template.tsx
- prefers-reduced-motion: desativa tudo
- Performance: nada de animação em layout props (use transform/opacity). LCP < 2.5s obrigatório.

## Dados
### products.json (src/data/products.json)
{ id, slug, name, brand: "nike"|"jordan"|"adidas"|..., category: "sneakers"|"jackets"|"accessories",
  price (number, BRL), sizes: string[], colors: string[], images: string[] (paths /products/slug/1.webp),
  video?: string, description: { pt, en }, featured: boolean, tags: string[], createdAt }
- Imagens SEMPRE .webp otimizadas (max 1600px) via scripts/optimize-images.ts
- Nunca hardcodar produto em componente. Tudo vem do JSON via src/lib/products.ts
### Supabase
- auth: email+senha e Google
- tabela orders: id, user_id (nullable), customer {name, phone, address}, items jsonb, total, status ('pending'|'confirmed'|'shipped'|'delivered'), created_at
- RLS: usuário lê só os próprios pedidos

## Checkout (V1)
1. Carrinho → formulário (nome, WhatsApp, endereço, obs) — login opcional
2. Salva order no Supabase (se logado, vincula user_id)
3. Monta mensagem e abre https://wa.me/5547988503312?text=... com: código do pedido, itens (nome, tam, qtd, preço), total, dados do cliente
4. Página /pedido/[id] mostra status (rastreio)

## Rotas
/ · /shop (filtros: brand, category, size, price; URL searchParams) · /product/[slug] · /cart · /checkout
/account (pedidos) · /login · /about · tudo sob /[locale] (pt default, en)

## Convenções
- Componentes em PascalCase, 1 por arquivo, server components por padrão, "use client" só quando precisa
- Sempre usar next/image com sizes correto
- Nenhuma lib de UI pronta (shadcn etc). UI própria, minimal
- Antes de dizer "pronto" numa tela: rodar dev, tirar screenshot com Playwright MCP em 390px e 1440px e verificar contra este design system
- Commits em inglês, conventional commits (feat:, fix:, style:)
- Em dúvida de design → perguntar, não inventar