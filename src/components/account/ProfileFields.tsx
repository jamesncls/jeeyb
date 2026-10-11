"use client";

import { BR_STATES, CustomerProfile } from "@/lib/profile";

export const ACCOUNT_INPUT =
  "w-full bg-background border border-line focus:border-wine px-3 py-2.5 text-sm rounded-sm outline-none transition-colors duration-300";
export const ACCOUNT_LABEL = "block font-mono text-xs text-muted mb-1";

interface ProfileFieldsProps {
  // Prefixo dos ids, pra dois formulários poderem coexistir na página.
  idPrefix: string;
  value: CustomerProfile;
  onChange: (value: CustomerProfile) => void;
}

// Campos de entrega (nome, WhatsApp e endereço), usados no cadastro e na edição do perfil.
export function ProfileFields({ idPrefix, value, onChange }: ProfileFieldsProps) {
  const set = (field: keyof CustomerProfile) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    onChange({ ...value, [field]: e.target.value });
  const id = (field: string) => `${idPrefix}-${field}`;

  return (
    <div className="grid grid-cols-6 gap-x-3 gap-y-4">
      <div className="col-span-6">
        <label htmlFor={id("name")} className={ACCOUNT_LABEL}>
          {"// NOME COMPLETO"}
        </label>
        <input
          id={id("name")}
          type="text"
          autoComplete="name"
          value={value.fullName}
          onChange={set("fullName")}
          className={ACCOUNT_INPUT}
        />
      </div>

      <div className="col-span-6 sm:col-span-3">
        <label htmlFor={id("phone")} className={ACCOUNT_LABEL}>
          {"// WHATSAPP"}
        </label>
        <input
          id={id("phone")}
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          placeholder="(47) 99999-9999"
          value={value.phone}
          onChange={set("phone")}
          className={ACCOUNT_INPUT}
        />
      </div>

      <div className="col-span-6 sm:col-span-3">
        <label htmlFor={id("cep")} className={ACCOUNT_LABEL}>
          {"// CEP"}
        </label>
        <input
          id={id("cep")}
          type="text"
          inputMode="numeric"
          autoComplete="postal-code"
          placeholder="00000-000"
          maxLength={9}
          value={value.cep}
          onChange={set("cep")}
          className={ACCOUNT_INPUT}
        />
      </div>

      <div className="col-span-4">
        <label htmlFor={id("street")} className={ACCOUNT_LABEL}>
          {"// ENDEREÇO"}
        </label>
        <input
          id={id("street")}
          type="text"
          autoComplete="address-line1"
          placeholder="Rua, avenida..."
          value={value.street}
          onChange={set("street")}
          className={ACCOUNT_INPUT}
        />
      </div>

      <div className="col-span-2">
        <label htmlFor={id("number")} className={ACCOUNT_LABEL}>
          {"// NÚMERO"}
        </label>
        <input
          id={id("number")}
          type="text"
          autoComplete="address-line2"
          value={value.number}
          onChange={set("number")}
          className={ACCOUNT_INPUT}
        />
      </div>

      <div className="col-span-6">
        <label htmlFor={id("neighborhood")} className={ACCOUNT_LABEL}>
          {"// BAIRRO"}
        </label>
        <input
          id={id("neighborhood")}
          type="text"
          autoComplete="address-level3"
          value={value.neighborhood}
          onChange={set("neighborhood")}
          className={ACCOUNT_INPUT}
        />
      </div>

      <div className="col-span-4">
        <label htmlFor={id("city")} className={ACCOUNT_LABEL}>
          {"// CIDADE"}
        </label>
        <input
          id={id("city")}
          type="text"
          autoComplete="address-level2"
          value={value.city}
          onChange={set("city")}
          className={ACCOUNT_INPUT}
        />
      </div>

      <div className="col-span-2">
        <label htmlFor={id("state")} className={ACCOUNT_LABEL}>
          {"// ESTADO"}
        </label>
        <select
          id={id("state")}
          autoComplete="address-level1"
          value={value.state}
          onChange={set("state")}
          className={ACCOUNT_INPUT}
        >
          <option value="">UF</option>
          {BR_STATES.map((state) => (
            <option key={state} value={state}>
              {state}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
