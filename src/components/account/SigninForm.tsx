"use client";

import { useState } from "react";
import { LogIn } from "lucide-react";
import { CustomerAuthResult, signInCustomer } from "@/lib/customer-auth";
import { ACCOUNT_INPUT, ACCOUNT_LABEL } from "./ProfileFields";
import { FormError } from "./FormError";

interface SigninFormProps {
  submitLabel: string;
  onSuccess: (result: CustomerAuthResult) => void;
}

// Aba [ JÁ TENHO CONTA ]: login com e-mail e senha.
export function SigninForm({ submitLabel, onSuccess }: SigninFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMsg("Preenche e-mail e senha.");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    const outcome = await signInCustomer(email.trim().toLowerCase(), password);
    setLoading(false);

    if ("error" in outcome) setErrorMsg(outcome.error);
    else onSuccess(outcome.result);
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <FormError message={errorMsg} />

      <div>
        <label htmlFor="signin-email" className={ACCOUNT_LABEL}>
          {"// E-MAIL"}
        </label>
        <input
          id="signin-email"
          type="email"
          autoComplete="username"
          placeholder="seu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={ACCOUNT_INPUT}
        />
      </div>

      <div>
        <label htmlFor="signin-password" className={ACCOUNT_LABEL}>
          {"// SENHA"}
        </label>
        <input
          id="signin-password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={ACCOUNT_INPUT}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full inline-flex items-center justify-center gap-2 bg-wine hover:bg-wine-light text-white font-mono text-xs uppercase tracking-wider py-4 rounded-sm transition-all duration-300 shadow-wine-glow active:scale-[0.98] disabled:opacity-50"
      >
        <LogIn className="w-4 h-4" aria-hidden />
        {loading ? "ENTRANDO..." : submitLabel}
      </button>
    </form>
  );
}
