import { supabase } from "@/lib/supabase";
import { CustomerProfile, loadCustomerProfile, profileToMetadata, saveProfile } from "@/lib/profile";

// Resultado de um cadastro/login de cliente que deu certo.
export interface CustomerAuthResult {
  userId: string;
  email: string;
  // Dados de entrega, quando já existem (no login pode vir null: conta antiga sem perfil).
  profile: CustomerProfile | null;
  // true quando a conta foi criada mas o Supabase ainda espera a confirmação do e-mail (sem sessão).
  awaitingEmailConfirmation: boolean;
}

type AuthOutcome = { result: CustomerAuthResult } | { error: string };

const EMAIL_TAKEN_MSG = "Este e-mail já está cadastrado. Faça login para continuar.";

function authErrorMessage(code: string | undefined, status: number | undefined) {
  switch (code) {
    case "invalid_credentials":
      return "E-mail ou senha incorretos.";
    case "email_not_confirmed":
      return "Falta confirmar seu e-mail: abre o link que a gente te mandou e tenta de novo.";
    case "user_already_exists":
    case "email_exists":
      return EMAIL_TAKEN_MSG;
    case "user_banned":
      return "Essa conta está bloqueada. Chama a gente no WhatsApp.";
    case "weak_password":
      return "Senha fraca demais. Usa pelo menos 6 caracteres.";
    case "email_address_invalid":
    case "validation_failed":
      return "Confere o e-mail: tem algo fora do formato.";
    case "signup_disabled":
      return "O cadastro tá fechado no momento. Chama a gente no WhatsApp.";
    case "over_request_rate_limit":
    case "over_email_send_rate_limit":
      return "Muitas tentativas seguidas. Espera um minuto e tenta de novo.";
  }
  if (status === 429) return "Muitas tentativas seguidas. Espera um minuto e tenta de novo.";
  if (!status) return "Sem conexão com o servidor. Confere sua internet e tenta de novo.";
  return "Não deu certo agora. Tenta de novo em instantes.";
}

export async function signUpCustomer(email: string, password: string, profile: CustomerProfile): Promise<AuthOutcome> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    // O link de confirmação volta pro /login, que já manda cada um pro lugar certo.
    options: { data: profileToMetadata(profile), emailRedirectTo: `${window.location.origin}/login` },
  });
  if (error || !data.user) return { error: authErrorMessage(error?.code, error?.status) };

  // Com confirmação de e-mail ligada o Supabase não devolve erro pra e-mail que já tem conta
  // (pra não revelar quem é cliente): devolve um usuário sem identidades e sem sessão.
  if (!data.session && data.user.identities?.length === 0) return { error: EMAIL_TAKEN_MSG };

  // Com sessão (confirmação de e-mail desligada) o cliente já sai logado e o perfil é gravado na
  // hora: quem chamou segue direto pro próximo passo. Sem sessão (e-mail por confirmar) o RLS não deixa:
  // os dados ficam no user_metadata e viram perfil no primeiro login.
  if (data.session) await saveProfile(data.user.id, profile);

  return {
    result: { userId: data.user.id, email, profile, awaitingEmailConfirmation: !data.session },
  };
}

export async function signInCustomer(email: string, password: string): Promise<AuthOutcome> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) return { error: authErrorMessage(error?.code, error?.status) };

  const profile = await loadCustomerProfile(data.user);
  return {
    result: { userId: data.user.id, email: data.user.email ?? email, profile, awaitingEmailConfirmation: false },
  };
}
