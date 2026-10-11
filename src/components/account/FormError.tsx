import { AlertTriangle } from "lucide-react";

// Caixa de erro dos formulários de conta e checkout.
export function FormError({ message }: { message: string }) {
  if (!message) return null;

  return (
    <div
      role="alert"
      className="p-3 bg-wine/20 border border-wine/50 rounded-sm text-fg flex items-start gap-2 font-mono text-xs leading-relaxed"
    >
      <AlertTriangle className="w-4 h-4 text-wine-glow shrink-0 mt-0.5" aria-hidden />
      <span>{message}</span>
    </div>
  );
}
