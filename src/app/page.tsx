import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/home/Hero";

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <Hero />
    </main>
  );
}