"use client";

import { useState } from "react";
import { UserPlus } from "lucide-react";
import { CustomerAuthResult, signUpCustomer } from "@/lib/customer-auth";
import { EMPTY_PROFILE, validateProfile } from "@/lib/profile";
import { ACCOUNT_INPUT, ACCOUNT_LABEL, ProfileFields } from "./ProfileFields";
import { FormError } from "./FormError";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;

interface SignupFormProps {
  submitLabel: string;
  onSuccess: (result: CustomerAuthResult) => void;
}

// Aba [ CRIAR CONTA ]: cria o usuário no Supabase Auth e guarda os dados de entrega.
export function SignupForm({ submitLabel, onSuccess }: SignupFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [profile, setProfile] = useState(EMPTY_PROFILE);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!EMAIL_PATTERN.test(cleanEmail)) {
      setErrorMsg("Confere o e-mail: tem algo fora do formato.");
      return;
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      setErrorMsg(`A senha precisa de pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`);
      return;
    }
    const validation = validateProfile(profile);
    if ("error" in validation) {
      setErrorMsg(validation.error);
      return;
    }

    setLoading(true);
    setErrorMsg("");
    const outcome = await signUpCustomer(cleanEmail, password, validation.profile);
    setLoading(false);

    if ("error" in outcome) setErrorMsg(outcome.error);
    else onSuccess(outcome.result);
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <FormError message={errorMsg} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-4">
        <div>
          <label htmlFor="signup-email" className={ACCOUNT_LABEL}>
            {"// E-MAIL"}
          </label>
          <input
            id="signup-email"
            type="email"
            autoComplete="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={ACCOUNT_INPUT}
          />
        </div>
        <div>
          <label htmlFor="signup-password" className={ACCOUNT_LABEL}>
            {"// SENHA"}
          </label>
          <input
            id="signup-password"
            type="password"
            autoComplete="new-password"
            placeholder={`Mínimo ${MIN_PASSWORD_LENGTH} caracteres`}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={ACCOUNT_INPUT}
          />
        </div>
      </div>

      <ProfileFields idPrefix="signup" value={profile} onChange={setProfile} />

      <button
        type="submit"
        disabled={loading}
        className="w-full inline-flex items-center justify-center gap-2 bg-wine hover:bg-wine-light text-white font-mono text-xs uppercase tracking-wider py-4 rounded-sm transition-all duration-300 shadow-wine-glow active:scale-[0.98] disabled:opacity-50"
      >
        <UserPlus className="w-4 h-4" aria-hidden />
        {loading ? "CRIANDO CONTA..." : submitLabel}
      </button>
    </form>
  );
}
