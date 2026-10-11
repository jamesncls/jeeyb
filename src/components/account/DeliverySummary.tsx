import { MapPin } from "lucide-react";
import { formatPhone } from "@/lib/format";
import { CustomerProfile, formatCityLine, formatStreetLine } from "@/lib/profile";

// Card "Entregar para": resumo dos dados de entrega salvos no perfil.
export function DeliverySummary({ profile, email }: { profile: CustomerProfile; email?: string }) {
  return (
    <div className="bg-background border border-line rounded-sm p-4">
      <span className="flex items-center gap-2 font-mono text-[10px] text-wine-light uppercase tracking-widest">
        <MapPin className="w-3.5 h-3.5" aria-hidden />
        ENTREGAR PARA
      </span>
      <p className="font-display font-bold text-base text-fg mt-2 break-words">{profile.fullName}</p>
      <p className="font-sans text-sm text-muted mt-1 leading-relaxed break-words">
        {formatStreetLine(profile)}
        <br />
        {formatCityLine(profile)}
      </p>
      <p className="font-mono text-xs text-muted mt-3 break-all">
        {formatPhone(profile.phone)}
        {email && ` · ${email}`}
      </p>
    </div>
  );
}
