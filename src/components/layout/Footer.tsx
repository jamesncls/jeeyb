import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { INSTAGRAM_URL, NAV_LINKS, WHATSAPP_NUMBER, whatsappLink } from "@/lib/site";

// 5547988503312 → +55 47 98850-3312
function formatWhatsApp(number: string) {
  const match = number.match(/^(\d{2})(\d{2})(\d{5})(\d{4})$/);
  return match ? `+${match[1]} ${match[2]} ${match[3]}-${match[4]}` : `+${number}`;
}

export function Footer() {
  const contacts = [
    { href: whatsappLink("Salve, jeeyb!"), label: "WHATSAPP", detail: formatWhatsApp(WHATSAPP_NUMBER) },
    ...(INSTAGRAM_URL ? [{ href: INSTAGRAM_URL, label: "INSTAGRAM", detail: "" }] : []),
  ];

  return (
    <footer className="bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10">
        <div className="sm:col-span-2 lg:col-span-6">
          <Link href="/" aria-label="jeeyb — início" className="font-display text-3xl font-bold tracking-tighter text-fg">
            jeeyb<span className="text-wine">.</span>
          </Link>
          <p className="font-sans text-sm text-muted mt-4 max-w-sm leading-relaxed">
            Streetwear original, curadoria de James &amp; Bruno. Seu próximo grail tá aqui.
          </p>
        </div>

        <nav aria-label="Rodapé" className="lg:col-span-3">
          <h2 className="font-mono text-[10px] text-wine-light uppercase tracking-widest mb-4">{"// NAVEGAR"}</h2>
          <ul className="space-y-3">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="font-mono text-xs tracking-widest text-muted hover:text-fg transition-colors duration-300"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="lg:col-span-3">
          <h2 className="font-mono text-[10px] text-wine-light uppercase tracking-widest mb-4">{"// CONTATO"}</h2>
          <ul className="space-y-3">
            {contacts.map((contact) => (
              <li key={contact.label}>
                <a
                  href={contact.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-1.5 font-mono text-xs tracking-widest text-muted hover:text-fg transition-colors duration-300"
                >
                  {contact.label}
                  <ArrowUpRight className="w-3 h-3 text-wine group-hover:text-wine-glow transition-colors duration-300" aria-hidden />
                  {contact.detail && <span className="text-fg/70 normal-case tracking-normal">{contact.detail}</span>}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-mono text-[10px] uppercase tracking-widest text-muted">
          <span>© JEEYB — TODOS OS DIREITOS RESERVADOS</span>
          <span className="inline-flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-wine-glow rounded-full animate-pulse" aria-hidden />
            {"// JEEYB SYSTEM V1.0"}
          </span>
        </div>
      </div>
    </footer>
  );
}
