"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

export function Hero() {
  return (
    <section className="relative w-full h-[85vh] min-h-[600px] flex items-center justify-center overflow-hidden border-b border-line">
      {/* Grid de fundo futurista */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      {/* Glow de luz vermelho vinho de fundo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-wine/25 blur-[140px] rounded-full pointer-events-none" />

      {/* VÍDEO HERO (Placeholder pronto para receber o vídeo da IA) */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover opacity-35 filter contrast-125"
          poster="/hero-fallback.jpg"
        >
          {/* Quando você tiver o vídeo gerado pelo Gemini, coloque no public/videos/hero-sneaker.mp4 */}
          <source src="/videos/hero-sneaker.mp4" type="video/mp4" />
        </video>
        {/* Overlay escuro em gradiente pra leitura do texto */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
      </div>

      {/* Conteúdo da Hero */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 text-center flex flex-col items-center">
        {/* Tag futurista de aviso/drop */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-wine/40 bg-wine/10 backdrop-blur-md mb-6"
        >
          <Sparkles className="w-3.5 h-3.5 text-wine-glow animate-pulse" />
          <span className="font-mono text-xs uppercase tracking-widest text-fg/90">
            // DROP 001 — LIMITED SELECTION
          </span>
        </motion.div>

        {/* Headline Principal */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="font-display text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white max-w-4xl leading-[1.08] mb-6"
        >
          seu próximo <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-wine-light">grail</span> tá aqui.
        </motion.h1>

        {/* Subtítulo */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="font-sans text-muted text-base sm:text-lg max-w-xl mb-8 leading-relaxed"
        >
          Curadoria exclusiva de Nike, Jordan e Adidas. Autenticidade garantida, peças selecionadas pra quem entende da cena.
        </motion.p>

        {/* Botoes de Ação (CTAs) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
        >
          <a
            href="#shop"
            className="inline-flex items-center justify-center gap-2 bg-wine hover:bg-wine-light text-white font-mono text-sm uppercase tracking-wider px-8 py-4 rounded-sm transition-all shadow-wine-glow hover:scale-[1.02] active:scale-[0.98]"
          >
            Explorar Catálogo
            <ArrowRight className="w-4 h-4" />
          </a>

          <a
            href="#brands"
            className="inline-flex items-center justify-center bg-surface hover:bg-surface2 border border-line hover:border-wine/50 text-white font-mono text-sm uppercase tracking-wider px-8 py-4 rounded-sm transition-all"
          >
            Ver Drops
          </a>
        </motion.div>
      </div>
    </section>
  );
}