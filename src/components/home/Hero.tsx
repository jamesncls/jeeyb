"use client";

import { useSyncExternalStore } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { HERO_VIDEOS } from "@/lib/site";
import { getHomeRevealed, subscribeSplash } from "@/lib/splash";
import { useHeroSlider } from "@/lib/use-hero-slider";
import { HeroVideos } from "./HeroVideos";
import { HeroSliderControls } from "./HeroSliderControls";

const EASE = [0.22, 1, 0.36, 1] as const;
const HEADLINE = ["seu", "próximo", "grail", "tá", "aqui."];

const headlineVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.03, delayChildren: 0.15 } },
};

const letterVariants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};

// Blocos de apoio (tag, subtítulo, CTAs): `custom` é o delay de cada um.
const fadeUpVariants = {
  hidden: { opacity: 0, y: 16 },
  show: (delay: number) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay, ease: EASE } }),
};

export function Hero() {
  const slider = useHeroSlider(HERO_VIDEOS);
  // A entrada do texto espera a splash começar a sair (ver SplashScreen).
  const revealed = useSyncExternalStore(subscribeSplash, getHomeRevealed, () => false);
  const entrance = revealed ? "show" : "hidden";

  return (
    <section className="relative w-full h-[88svh] min-h-[600px] flex items-center justify-center overflow-hidden border-b border-line">
      {/* Vídeos de fundo (lista em HERO_VIDEOS, src/lib/site.ts) */}
      <HeroVideos
        mounted={slider.mounted}
        active={slider.active}
        shown={slider.shown}
        onReady={slider.markReady}
        onFailed={slider.markFailed}
      />

      {/* Overlay escuro em gradiente pra leitura do texto */}
      <div className="absolute inset-0 bg-linear-to-t from-background via-background/60 to-background/30" />

      {/* Grid de fundo futurista */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Glow vinho flutuando ao fundo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <motion.div
          animate={{ x: [0, 40, -30, 0], y: [0, -24, 18, 0], scale: [1, 1.08, 0.96, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="w-[600px] max-w-[90vw] h-[350px] bg-wine/25 blur-[140px] rounded-full"
        />
      </div>

      {/* Conteúdo */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 pb-12 lg:pb-0 text-center flex flex-col items-center">
        <motion.div
          variants={fadeUpVariants}
          custom={0}
          initial="hidden"
          animate={entrance}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-sm border border-wine/40 bg-wine/10 backdrop-blur-md mb-6"
        >
          <Sparkles className="w-3.5 h-3.5 text-wine-glow animate-pulse" aria-hidden />
          <span className="font-mono text-[10px] sm:text-xs uppercase tracking-widest text-fg/90">
            [ // DROP 001 — LIMITED SELECTION ]
          </span>
        </motion.div>

        {/* Headline com reveal letra a letra; "grail" entra inteiro pra manter o gradiente */}
        <motion.h1
          aria-label={HEADLINE.join(" ")}
          variants={headlineVariants}
          initial="hidden"
          animate={entrance}
          className="font-display text-[2.6rem] sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-balance text-fg max-w-5xl leading-[1.05] mb-6"
        >
          {HEADLINE.map((word) => (
            <span key={word} aria-hidden className="inline-block whitespace-nowrap mx-[0.12em]">
              {word === "grail" ? (
                <motion.span
                  variants={letterVariants}
                  className="inline-block bg-linear-to-r from-fg via-wine-glow to-wine-light bg-clip-text text-transparent"
                >
                  {word}
                </motion.span>
              ) : (
                word.split("").map((letter, index) => (
                  <motion.span key={index} variants={letterVariants} className="inline-block">
                    {letter}
                  </motion.span>
                ))
              )}
            </span>
          ))}
        </motion.h1>

        <motion.p
          variants={fadeUpVariants}
          custom={0.7}
          initial="hidden"
          animate={entrance}
          className="font-sans text-muted text-base sm:text-lg max-w-xl mb-9 leading-relaxed"
        >
          Curadoria de Nike, Jordan e Adidas pra quem vive a cena. Só peça original, só heat. Chegou, viu, copou.
        </motion.p>

        <motion.div
          variants={fadeUpVariants}
          custom={0.85}
          initial="hidden"
          animate={entrance}
          className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
        >
          <a
            href="#shop"
            className="group inline-flex items-center justify-center gap-2 bg-wine hover:bg-wine-light text-white font-mono text-sm uppercase tracking-wider px-8 py-4 rounded-sm transition-all duration-300 shadow-wine-glow hover:scale-[1.02] active:scale-[0.98]"
          >
            Explorar catálogo
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
          </a>

          <a
            href="#drops"
            className="inline-flex items-center justify-center bg-surface/80 hover:bg-surface2 border border-line hover:border-wine/60 hover:shadow-wine-glow text-fg font-mono text-sm uppercase tracking-wider px-8 py-4 rounded-sm transition-all duration-300 active:scale-[0.98]"
          >
            Ver drops
          </a>
        </motion.div>
      </div>

      <HeroSliderControls
        count={slider.count}
        activeIndex={slider.activeIndex}
        onPrevious={slider.previous}
        onNext={slider.next}
        onSelect={slider.goTo}
      />

      {/* Rodapé técnico da hero */}
      <div className="absolute bottom-0 inset-x-0 z-10 border-t border-line/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-11 flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-muted">
          <span>{"// SCROLL ↓"}</span>
          <span>NIKE / JORDAN / ADIDAS</span>
        </div>
      </div>
    </section>
  );
}
