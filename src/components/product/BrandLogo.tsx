import { siAdidas, siJordan, siNewbalance, siNike, siPuma } from "simple-icons";

// Logos oficiais (simple-icons), por nome de marca em minúsculas.
const BRAND_ICONS: Record<string, { title: string; path: string }> = {
  nike: siNike,
  jordan: siJordan,
  adidas: siAdidas,
  puma: siPuma,
  "new balance": siNewbalance,
};

// Logo da marca, sozinho, acima do nome do produto. Marca sem logo cadastrado não mostra nada.
export function BrandLogo({ brand, className = "" }: { brand: string; className?: string }) {
  const icon = BRAND_ICONS[brand.trim().toLowerCase()];
  if (!icon) return null;

  return (
    <svg role="img" aria-label={`Logo ${icon.title}`} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d={icon.path} />
    </svg>
  );
}
