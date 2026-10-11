"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ShoppingBag, Search, User, Menu, X } from "lucide-react";
import type { User as AuthUser } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { AccountModal } from "@/components/account/AccountModal";
import { useCartStore } from "@/lib/cart-store";
import { NAV_LINKS } from "@/lib/site";

const EASE = [0.22, 1, 0.36, 1] as const;

// Quem está logado: ninguém, um admin (vai pro painel) ou um cliente (abre "minha conta").
type Account = { kind: "guest" } | { kind: "admin" } | { kind: "customer"; user: AuthUser };

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [account, setAccount] = useState<Account>({ kind: "guest" });
  const [accountOpen, setAccountOpen] = useState(false);
  const closeAccount = useCallback(() => setAccountOpen(false), []);
  const cartCount = useCartStore((state) => state.getTotalItems());
  const openCart = useCartStore((state) => state.openCart);

  // Sessão do Supabase só decide o que o ícone de conta faz; quem protege o /admin é o servidor.
  useEffect(() => {
    let active = true;
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setAccount({ kind: "guest" });
        return;
      }
      // Fora do callback: chamar o Supabase aqui dentro trava o cliente de auth.
      setTimeout(() => {
        supabase.rpc("is_admin").then(({ data: isAdmin }) => {
          if (active) setAccount(isAdmin === true ? { kind: "admin" } : { kind: "customer", user: session.user });
        });
      }, 0);
    });
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileMenuOpen]);

  const accountHref = account.kind === "admin" ? "/admin" : "/admin/login";
  const accountLabel = account.kind === "admin" ? "[ PAINEL ]" : account.kind === "customer" ? "[ MINHA CONTA ]" : "[ ENTRAR ]";
  const mobileItemClass =
    "flex w-full items-center justify-between py-4 font-mono text-sm tracking-widest text-muted hover:text-fg transition-colors duration-300";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-line/60 bg-background/70 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 md:h-20 flex items-center justify-between md:grid md:grid-cols-[1fr_auto_1fr]">
        {/* Links (desktop) */}
        <nav aria-label="Principal" className="hidden md:flex items-center gap-7">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-mono text-xs tracking-widest text-muted hover:text-fg transition-colors duration-300"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Logo */}
        <Link href="/" aria-label="jeeyb — início" className="group flex items-center">
          {/* data-splash-target: é pra cá que o logo da splash da home encolhe */}
          <span data-splash-target className="font-display text-2xl font-bold tracking-tighter text-fg">
            jeeyb
            <span className="text-wine transition-colors duration-300 group-hover:text-wine-glow">.</span>
          </span>
        </Link>

        {/* Ações */}
        <div className="flex items-center justify-end gap-1 sm:gap-2">
          <Link
            href="/#shop"
            aria-label="Buscar no catálogo"
            className="p-2 text-muted hover:text-fg transition-colors duration-300"
          >
            <Search className="w-5 h-5" />
          </Link>

          {account.kind === "customer" ? (
            <button
              type="button"
              aria-label="Minha conta"
              aria-haspopup="dialog"
              onClick={() => setAccountOpen(true)}
              className="hidden sm:block p-2 text-wine-glow hover:text-fg transition-colors duration-300"
            >
              <User className="w-5 h-5" />
            </button>
          ) : (
            <Link
              href={accountHref}
              aria-label={account.kind === "admin" ? "Painel admin" : "Entrar"}
              className="hidden sm:block p-2 text-muted hover:text-fg transition-colors duration-300"
            >
              <User className="w-5 h-5" />
            </Link>
          )}

          <button
            type="button"
            aria-label={`Abrir carrinho, ${cartCount} ${cartCount === 1 ? "item" : "itens"}`}
            aria-haspopup="dialog"
            onClick={openCart}
            className="group relative ml-1 p-2 bg-surface hover:bg-surface2 border border-line hover:border-wine/60 hover:shadow-wine-subtle rounded-sm transition-all duration-300"
          >
            <ShoppingBag className="w-5 h-5 text-fg group-hover:text-wine-glow transition-colors duration-300" />
            <span className="absolute -top-1.5 -right-1.5 bg-wine text-white font-mono text-[10px] min-w-5 h-5 px-1 rounded-full flex items-center justify-center border border-background font-bold">
              {cartCount > 99 ? "99+" : cartCount}
            </span>
          </button>

          <button
            type="button"
            aria-label={mobileMenuOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMobileMenuOpen((open) => !open)}
            className="md:hidden ml-1 p-2 text-muted hover:text-fg transition-colors duration-300"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Menu mobile: painel absoluto, anima só opacity/transform */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.nav
            id="mobile-menu"
            aria-label="Menu mobile"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="md:hidden absolute inset-x-0 top-full border-b border-line bg-background shadow-[0_24px_48px_rgba(0,0,0,0.6)]"
          >
            <ul className="px-4 py-4">
              {[...NAV_LINKS, { href: accountHref, label: accountLabel }].map((link, index) => (
                <motion.li
                  key={link.label}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.04 * index, ease: EASE }}
                  className="border-b border-line/50 last:border-b-0"
                >
                  {link.label === accountLabel && account.kind === "customer" ? (
                    <button
                      type="button"
                      aria-haspopup="dialog"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setAccountOpen(true);
                      }}
                      className={mobileItemClass}
                    >
                      {link.label}
                      <span aria-hidden className="text-wine">
                        →
                      </span>
                    </button>
                  ) : (
                    <Link href={link.href} onClick={() => setMobileMenuOpen(false)} className={mobileItemClass}>
                      {link.label}
                      <span aria-hidden className="text-wine">
                        →
                      </span>
                    </Link>
                  )}
                </motion.li>
              ))}
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>

      <AccountModal
        user={account.kind === "customer" ? account.user : null}
        open={accountOpen}
        onClose={closeAccount}
      />
    </header>
  );
}
