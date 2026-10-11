import { Gem, ShieldCheck, Zap } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";

const PILLARS = [
  {
    icon: ShieldCheck,
    label: "// 100% AUTHENTIC",
    text: "Só peça original. Réplica não passa pela porta.",
  },
  {
    icon: Gem,
    label: "// CURATED SELECTION",
    text: "Nike, Jordan, Adidas e streetwear escolhidos a dedo. Menos volume, mais grail.",
  },
  {
    icon: Zap,
    label: "// FAST EXPRESS DELIVERY",
    text: "Fechou no WhatsApp, a gente despacha rápido e te mantém no loop até chegar.",
  },
];

export function Manifesto() {
  return (
    <section id="sobre" className="relative scroll-mt-20 border-y border-line overflow-hidden">
      {/* Grid de fundo futurista */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />
      <div className="absolute -bottom-40 -left-40 w-[480px] h-[480px] bg-wine/15 blur-[140px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
        <Reveal className="lg:col-span-7">
          <span className="font-mono text-xs text-wine-light uppercase tracking-widest">{"// MANIFESTO"}</span>
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight lowercase text-fg mt-2 leading-[1.05]">
            a rua dita o heat. <span className="block text-wine-glow">a gente faz a curadoria.</span>
          </h2>
          <div className="mt-8 space-y-4 max-w-xl font-sans text-base sm:text-lg text-muted leading-relaxed">
            <p>
              A jeeyb é James &amp; Bruno, daí o nome. Dois nomes, uma regra: só entra na loja o que a gente usaria.
            </p>
            <p>
              Skate, rap, trap, eletrônica. É dessa cena que sai cada escolha: tênis, casaco e acessório com
              história, não só com etiqueta.
            </p>
            <p className="text-fg">Sem réplica. Sem enrolação. Só grail.</p>
          </div>
          <p className="mt-8 font-mono text-xs text-muted uppercase tracking-widest">[ JAMES &amp; BRUNO ] — JEEYB</p>
        </Reveal>

        <ul className="lg:col-span-5 flex flex-col gap-4">
          {PILLARS.map((pillar, index) => (
            <li key={pillar.label}>
              <Reveal delay={0.1 * index}>
                <div className="group flex items-start gap-4 bg-surface/80 backdrop-blur-sm border border-line hover:border-wine/60 hover:shadow-wine-glow rounded-sm p-5 sm:p-6 transition-[border-color,box-shadow] duration-300">
                  <div className="shrink-0 p-2.5 bg-wine/15 border border-wine/40 rounded-sm">
                    <pillar.icon className="w-5 h-5 text-wine-glow" aria-hidden />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-mono text-xs sm:text-sm text-fg uppercase tracking-widest">{pillar.label}</h3>
                      <span className="font-mono text-[10px] text-muted">0{index + 1}</span>
                    </div>
                    <p className="font-sans text-sm text-muted mt-2 leading-relaxed">{pillar.text}</p>
                  </div>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
