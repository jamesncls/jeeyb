"use client";

import Link from "next/link";
import { ShoppingBag, Search, User, Menu, X } from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-line/60 bg-background/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Navigation Links (Desktop Left) */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link
            href="#shop"
            className="text-sm font-mono tracking-wider text-muted hover:text-white transition-colors"
          >
            // CATÁLOGO
          </Link>
          <Link
            href="#brands"
            className="text-sm font-mono tracking-wider text-muted hover:text-white transition-colors"
          >
            // MARCAS
          </Link>
          <Link
            href="#about"
            className="text-sm font-mono tracking-wider text-muted hover:text-white transition-colors"
          >
            // SOBRE
          </Link>
        </nav>

        {/* LOGO JEEYB */}
        <Link href="/" className="flex items-center group">
          <span className="font-display text-2xl font-bold tracking-tighter text-white group-hover:text-wine-light transition-colors">
            jeeyb<span className="text-wine">.</span>
          </span>
        </Link>

        {/* Right Actions (Cart, Search, User) */}
        <div className="flex items-center space-x-6">
          <button
            aria-label="Buscar"
            className="text-muted hover:text-white transition-colors"
          >
            <Search className="w-5 h-5" />
          </button>
          
          <button
            aria-label="Conta"
            className="text-muted hover:text-white transition-colors hidden sm:block"
          >
            <User className="w-5 h-5" />
          </button>

          {/* Cart Icon com contador */}
          <button
            aria-label="Carrinho"
            className="relative p-2 bg-surface hover:bg-surface2 border border-line hover:border-wine/50 rounded-sm transition-all group"
          >
            <ShoppingBag className="w-5 h-5 text-white group-hover:text-wine-light transition-colors" />
            <span className="absolute -top-1.5 -right-1.5 bg-wine text-white font-mono text-[10px] w-5 h-5 rounded-full flex items-center justify-center border border-background font-bold">
              0
            </span>
          </button>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-muted hover:text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-surface border-b border-line px-4 pt-4 pb-6 space-y-4 font-mono text-sm">
          <Link
            href="#shop"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-muted hover:text-white py-2"
          >
            // CATÁLOGO
          </Link>
          <Link
            href="#brands"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-muted hover:text-white py-2"
          >
            // MARCAS
          </Link>
          <Link
            href="#about"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-muted hover:text-white py-2"
          >
            // SOBRE
          </Link>
        </div>
      )}
    </header>
  );
}