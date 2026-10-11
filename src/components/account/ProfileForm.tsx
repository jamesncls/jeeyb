"use client";

import { useState } from "react";
import { CustomerProfile, EMPTY_PROFILE, saveProfile, validateProfile } from "@/lib/profile";
import { ProfileFields } from "./ProfileFields";
import { FormError } from "./FormError";

interface ProfileFormProps {
  userId: string;
  initial: CustomerProfile | null;
  submitLabel: string;
  onSaved: (profile: CustomerProfile) => void;
  onCancel?: () => void;
}

// Completar ou editar os dados de entrega de quem já está logado.
export function ProfileForm({ userId, initial, submitLabel, onSaved, onCancel }: ProfileFormProps) {
  const [profile, setProfile] = useState<CustomerProfile>(initial ?? EMPTY_PROFILE);
  const [errorMsg, setErrorMsg] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validation = validateProfile(profile);
    if ("error" in validation) {
      setErrorMsg(validation.error);
      return;
    }

    setSaving(true);
    setErrorMsg("");
    // Se o perfil não gravar, o pedido segue com os dados digitados (o aviso fica no console).
    await saveProfile(userId, validation.profile);
    setSaving(false);
    onSaved(validation.profile);
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <FormError message={errorMsg} />
      <ProfileFields idPrefix="profile" value={profile} onChange={setProfile} />

      <div className="flex items-center gap-3 pt-1">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="font-mono text-xs uppercase tracking-wider text-muted hover:text-fg border border-line px-4 py-4 rounded-sm transition-colors duration-300"
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          disabled={saving}
          className="flex-1 inline-flex items-center justify-center bg-wine hover:bg-wine-light text-white font-mono text-xs uppercase tracking-wider py-4 rounded-sm transition-all duration-300 shadow-wine-glow active:scale-[0.98] disabled:opacity-50"
        >
          {saving ? "SALVANDO..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
