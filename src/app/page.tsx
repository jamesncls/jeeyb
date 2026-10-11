import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/home/Hero";
import { ProductGrid } from "@/components/shop/ProductGrid";

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-fg">
      <Navbar />
      <Hero />
      <ProductGrid />
    </main>
  );
}