"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { AlertTriangle, Lock } from "lucide-react";
import { supabase } from "@/lib/supabase";

const NOT_ADMIN_MSG = "Essa conta não tem acesso ao painel. Só admin entra aqui.";

function loginErrorMessage(code: string | undefined, status: number | undefined) {
  switch (code) {
    case "invalid_credentials":
      return "E-mail ou senha incorretos.";
    case "email_not_confirmed":
      return "Esse e-mail ainda não foi confirmado. Confirma pelo link que chegou na sua caixa de entrada.";
    case "user_banned":
      return "Essa conta está bloqueada.";
    case "over_request_rate_limit":
      return "Muitas tentativas seguidas. Espera um minuto e tenta de novo.";
    case "validation_failed":
      return "Confere o e-mail e a senha: tem algo fora do formato.";
  }
  if (status === 429) return "Muitas tentativas seguidas. Espera um minuto e tenta de novo.";
  if (!status) return "Sem conexão com o servidor. Confere sua internet e tenta de novo.";
  return "Não deu pra entrar agora. Tenta de novo em instantes.";
}

export function LoginForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(
    searchParams.get("erro") === "sem-permissao" ? NOT_ADMIN_MSG : ""
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMsg("Preenche e-mail e senha.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) {
      setErrorMsg(loginErrorMessage(error.code, error.status));
      setLoading(false);
      return;
    }

    const { data: isAdmin, error: adminError } = await supabase.rpc("is_admin");
    if (adminError || isAdmin !== true) {
      await supabase.auth.signOut();
      setErrorMsg(
        adminError
          ? "Login ok, mas não deu pra checar a permissão de admin. Confere se o supabase/admin-security.sql já foi rodado."
          : NOT_ADMIN_MSG
      );
      setLoading(false);
      return;
    }

    // Navegação completa: o proxy e o servidor leem o cookie de sessão novo.
    window.location.assign("/admin");
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="bg-surface border border-line rounded-sm p-6 space-y-4">
      {errorMsg && (
        <div
          role="alert"
          className="p-3 bg-wine/20 border border-wine/50 rounded-sm text-fg flex items-start gap-2 font-mono text-xs leading-relaxed"
        >
          <AlertTriangle className="w-4 h-4 text-wine-glow shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div>
        <label htmlFor="admin-email" className="block font-mono text-xs text-muted mb-1">
          // E-MAIL
        </label>
        <input
          id="admin-email"
          type="email"
          autoComplete="username"
          placeholder="seu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-background border border-line focus:border-wine px-3 py-2 text-sm rounded-sm outline-none transition-colors"
        />
      </div>

      <div>
        <label htmlFor="admin-password" className="block font-mono text-xs text-muted mb-1">
          // SENHA
        </label>
        <input
          id="admin-password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-background border border-line focus:border-wine px-3 py-2 text-sm rounded-sm outline-none transition-colors"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full inline-flex items-center justify-center gap-2 bg-wine hover:bg-wine-light text-white font-mono text-xs uppercase tracking-wider py-3 rounded-sm transition-all duration-300 shadow-wine-glow disabled:opacity-50"
      >
        <Lock className="w-3.5 h-3.5" />
        {loading ? "ENTRANDO..." : "ENTRAR"}
      </button>
    </form>
  );
}
