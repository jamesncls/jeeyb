import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { normalizePhone } from "@/lib/format";

// Dados de entrega do cliente, como o app usa. No banco é a tabela public.profiles (ver toRow/fromRow).
export interface CustomerProfile {
  fullName: string;
  phone: string; // só dígitos, com DDI
  cep: string; // só dígitos
  street: string;
  number: string;
  complement: string; // opcional (apto, bloco...)
  neighborhood: string;
  city: string;
  state: string; // UF
}

export const EMPTY_PROFILE: CustomerProfile = {
  fullName: "",
  phone: "",
  cep: "",
  street: "",
  number: "",
  complement: "",
  neighborhood: "",
  city: "",
  state: "",
};

export const BR_STATES = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA",
  "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
];

type ProfileRow = {
  full_name: string | null;
  phone: string | null;
  address_zipcode: string | null;
  address_street: string | null;
  address_number: string | null;
  address_complement: string | null;
  address_neighborhood: string | null;
  address_city: string | null;
  address_state: string | null;
};

const PROFILE_COLUMNS =
  "full_name, phone, address_zipcode, address_street, address_number, address_complement, address_neighborhood, address_city, address_state";

function fromRow(row: ProfileRow): CustomerProfile {
  return {
    fullName: row.full_name ?? "",
    phone: row.phone ?? "",
    cep: row.address_zipcode ?? "",
    street: row.address_street ?? "",
    number: row.address_number ?? "",
    complement: row.address_complement ?? "",
    neighborhood: row.address_neighborhood ?? "",
    city: row.address_city ?? "",
    state: row.address_state ?? "",
  };
}

function toRow(profile: CustomerProfile): ProfileRow {
  return {
    full_name: profile.fullName,
    phone: profile.phone,
    address_zipcode: profile.cep,
    address_street: profile.street,
    address_number: profile.number,
    address_complement: profile.complement,
    address_neighborhood: profile.neighborhood,
    address_city: profile.city,
    address_state: profile.state,
  };
}

const OPTIONAL_FIELDS: (keyof CustomerProfile)[] = ["complement"];

export function isProfileComplete(profile: CustomerProfile | null): profile is CustomerProfile {
  if (!profile) return false;
  return (Object.keys(profile) as (keyof CustomerProfile)[]).every(
    (field) => OPTIONAL_FIELDS.includes(field) || (profile[field] ?? "").trim().length > 0
  );
}

// Limpa e valida o que veio do formulário. Devolve o perfil pronto ou a mensagem de erro.
export function validateProfile(input: CustomerProfile): { profile: CustomerProfile } | { error: string } {
  const fullName = input.fullName.trim().replace(/\s+/g, " ");
  if (fullName.length < 3 || !fullName.includes(" ")) return { error: "Coloca seu nome completo (nome e sobrenome)." };

  const phone = normalizePhone(input.phone);
  if (!phone) return { error: "Confere seu WhatsApp: precisa do DDD + número, tipo (47) 99999-9999." };

  const cep = input.cep.replace(/\D/g, "");
  if (cep.length !== 8) return { error: "CEP precisa ter 8 números." };

  const street = input.street.trim();
  const number = input.number.trim();
  const complement = (input.complement ?? "").trim();
  const neighborhood = input.neighborhood.trim();
  const city = input.city.trim();
  if (!street || !number || !neighborhood || !city) {
    return { error: "Preenche endereço, número, bairro e cidade." };
  }
  if (!BR_STATES.includes(input.state)) return { error: "Escolhe o estado." };

  return { profile: { fullName, phone, cep, street, number, complement, neighborhood, city, state: input.state } };
}

export function formatCep(cep: string) {
  const digits = cep.replace(/\D/g, "");
  return digits.length === 8 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : cep;
}

// "Rua X, 123, Apto 4 — Bairro" (o complemento só aparece quando existe)
export function formatStreetLine(profile: CustomerProfile) {
  const complement = profile.complement ? `, ${profile.complement}` : "";
  return `${profile.street}, ${profile.number}${complement} — ${profile.neighborhood}`;
}

// "Cidade / UF — CEP 00000-000"
export function formatCityLine(profile: CustomerProfile) {
  return `${profile.city} / ${profile.state} — CEP ${formatCep(profile.cep)}`;
}

export async function fetchProfile(userId: string): Promise<CustomerProfile | null> {
  const { data, error } = await supabase.from("profiles").select(PROFILE_COLUMNS).eq("id", userId).maybeSingle();
  if (error || !data) return null;
  return fromRow(data as ProfileRow);
}

export async function saveProfile(userId: string, profile: CustomerProfile) {
  const { error } = await supabase
    .from("profiles")
    .upsert({ id: userId, ...toRow(profile), updated_at: new Date().toISOString() });
  if (error) console.warn("Perfil não foi salvo no Supabase:", error.message);
  return !error;
}

// Os dados do cadastro também vão no user_metadata (options.data do signUp), com os mesmos nomes
// das colunas de public.profiles: full_name, phone, address_zipcode, address_street, address_number,
// address_complement, address_neighborhood, address_city e address_state. Com confirmação de e-mail
// ligada não existe sessão logo após o signUp, então o perfil só pode ser gravado no primeiro
// login (ver loadCustomerProfile) ou por um trigger no banco lendo esse metadata.
export function profileToMetadata(profile: CustomerProfile) {
  return { ...toRow(profile) };
}

function profileFromMetadata(metadata: User["user_metadata"]): CustomerProfile | null {
  if (!metadata || typeof metadata.full_name !== "string") return null;
  return fromRow(metadata as ProfileRow);
}

// Perfil do usuário logado: lê a tabela profiles e, se faltar algo, completa com o que veio no cadastro.
export async function loadCustomerProfile(user: User): Promise<CustomerProfile | null> {
  const stored = await fetchProfile(user.id);
  if (isProfileComplete(stored)) return stored;

  const fromSignup = profileFromMetadata(user.user_metadata);
  if (isProfileComplete(fromSignup)) {
    await saveProfile(user.id, fromSignup);
    return fromSignup;
  }
  return stored;
}
