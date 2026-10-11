"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useAnimate, useReducedMotion } from "framer-motion";
import { getSplashSeen, markSplashSeen, revealHome, subscribeSplash } from "@/lib/splash";

const EASE = [0.22, 1, 0.36, 1] as const;
const HOLD_MS = 900;
const FONTS_TIMEOUT_MS = 1500;
// Se a animação não terminar (aba em segundo plano não roda frames), a splash sai mesmo assim.
const FAILSAFE_MS = 2500;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Tela de entrada da home: logo grande no centro que encolhe até o logo da Navbar
// enquanto o fundo some. Roda a cada carregamento da home (F5); o scroll fica travado via CSS
// (regras de [data-splash-root] no globals.css) enquanto ela existe.
export function SplashScreen() {
  const seen = useSyncExternalStore(subscribeSplash, getSplashSeen, () => false);
  const reduceMotion = useReducedMotion();
  const [scope, animate] = useAnimate<HTMLDivElement>();

  useEffect(() => {
    if (getSplashSeen()) return;
    let cancelled = false;

    async function run() {
      // Espera a fonte do logo pra medir o tamanho certo, sem segurar a tela se ela demorar.
      await Promise.race([document.fonts.ready, wait(FONTS_TIMEOUT_MS)]);
      await wait(HOLD_MS);
      if (cancelled || !scope.current) return;

      const logo = scope.current.querySelector<HTMLElement>("[data-splash-logo]");
      const target = document.querySelector<HTMLElement>("[data-splash-target]");
      revealHome();

      if (logo && target && !reduceMotion) {
        const from = logo.getBoundingClientRect();
        const to = target.getBoundingClientRect();
        const exit = Promise.all([
          animate(
            logo,
            {
              x: to.left + to.width / 2 - (from.left + from.width / 2),
              y: to.top + to.height / 2 - (from.top + from.height / 2),
              scale: to.width / from.width,
            },
            { duration: 1, ease: EASE }
          ),
          animate("[data-splash-backdrop]", { opacity: 0 }, { duration: 0.7, delay: 0.3, ease: "easeOut" }),
        ]);
        await Promise.race([exit, wait(FAILSAFE_MS)]);
      } else {
        await Promise.race([animate(scope.current, { opacity: 0 }, { duration: 0.4 }), wait(FAILSAFE_MS)]);
      }

      if (!cancelled) markSplashSeen();
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [animate, reduceMotion, scope]);

  if (seen) return null;

  return (
    <div
      ref={scope}
      data-splash-root
      aria-hidden
      className="fixed inset-0 z-[100] flex items-center justify-center"
    >
      <div data-splash-backdrop className="absolute inset-0 bg-background" />
      <span
        data-splash-logo
        className="relative font-display font-bold tracking-tighter text-fg text-[clamp(4rem,18vw,11rem)] leading-[1.3333] will-change-transform"
      >
        jeeyb<span className="text-wine">.</span>
      </span>
    </div>
  );
}
