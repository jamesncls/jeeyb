import { StoreShell } from "@/components/layout/StoreShell";
import { Hero } from "@/components/home/Hero";
import { SplashScreen } from "@/components/home/SplashScreen";
import { FeaturedDrops } from "@/components/home/FeaturedDrops";
import { Manifesto } from "@/components/home/Manifesto";
import { ProductGrid } from "@/components/shop/ProductGrid";

export default function Home() {
  return (
    <StoreShell>
      <SplashScreen />
      <Hero />
      <FeaturedDrops />
      <ProductGrid />
      <Manifesto />
    </StoreShell>
  );
}
