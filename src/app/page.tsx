import { MotionProvider } from "@/components/layout/MotionProvider";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/home/Hero";
import { FeaturedDrops } from "@/components/home/FeaturedDrops";
import { Manifesto } from "@/components/home/Manifesto";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { SizePicker } from "@/components/cart/SizePicker";

export default function Home() {
  return (
    <MotionProvider>
      <Navbar />
      <main className="flex-1 bg-background text-fg">
        <Hero />
        <FeaturedDrops />
        <ProductGrid />
        <Manifesto />
      </main>
      <Footer />
      <CartDrawer />
      <SizePicker />
    </MotionProvider>
  );
}
