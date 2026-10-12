import { Suspense } from "react";
import type { Metadata } from "next";
import { AdminGate } from "@/components/admin/AdminGate";

export const metadata: Metadata = {
  title: "Admin — jeeyb",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <span className="font-mono text-sm text-muted animate-pulse">{"// VERIFICANDO ACESSO..."}</span>
        </div>
      }
    >
      <AdminGate />
    </Suspense>
  );
}
