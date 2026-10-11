import type { ReactNode } from "react";
import { MotionProvider } from "./MotionProvider";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { SizePicker } from "@/components/cart/SizePicker";

// Moldura das páginas da loja: navbar, footer e o carrinho (gaveta + seletor de tamanho).
export function StoreShell({ children }: { children: ReactNode }) {
  return (
    <MotionProvider>
      <Navbar />
      <main className="flex-1 bg-background text-fg">{children}</main>
      <Footer />
      <CartDrawer />
      <SizePicker />
    </MotionProvider>
  );
}
