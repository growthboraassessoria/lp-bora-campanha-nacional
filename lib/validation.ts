// Validação do cadastro. As mensagens seguem o tom da marca e são as mesmas no cliente e no servidor.

export const MESSAGES = {
  cep: "Não achamos esse CEP. Confira os 8 dígitos.",
  phone: "Coloque o DDD e o número.",
  email: "Confere o e-mail? Parece que falta alguma coisa.",
  firstName: "Como a gente te chama?",
  lastName: "E o sobrenome?",
  consent: "Precisamos do seu aceite para seguir.",
  existing: "Você já está no movimento.",
  generic: "Deu ruim por aqui. Tenta de novo em alguns segundos.",
  unavailable: "O cadastro está fechado neste momento. Tenta de novo mais tarde.",
};

export type LeadFields = {
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  cep: string;
  privacy_consent: boolean;
  marketing_consent: boolean;
};

export type FieldErrors = Partial<Record<keyof LeadFields, string>>;

export function cleanPhone(v: string) {
  let d = String(v ?? "").replace(/\D/g, "");
  if (d.startsWith("55") && d.length > 11) d = d.slice(2);
  return d;
}

export function isValidPhone(v: string) {
  const d = cleanPhone(v);
  if (d.length < 10 || d.length > 11) return false;
  const ddd = Number(d.slice(0, 2));
  if (ddd < 11 || ddd > 99) return false;
  if (d.length === 11 && d[2] !== "9") return false;
  return !/^(\d)\1+$/.test(d.slice(2));
}

export function isValidEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v ?? "").trim());
}

export function validateLead(f: LeadFields): FieldErrors {
  const e: FieldErrors = {};
  if (!f.first_name || f.first_name.trim().length < 2 || f.first_name.length > 40) e.first_name = MESSAGES.firstName;
  if (!f.last_name || f.last_name.trim().length < 1 || f.last_name.length > 60) e.last_name = MESSAGES.lastName;
  if (!isValidPhone(f.phone)) e.phone = MESSAGES.phone;
  if (!isValidEmail(f.email)) e.email = MESSAGES.email;
  if (!/^\d{8}$/.test(String(f.cep ?? "").replace(/\D/g, ""))) e.cep = MESSAGES.cep;
  if (!f.privacy_consent) e.privacy_consent = MESSAGES.consent;
  return e;
}

export function formatPhone(d: string) {
  const v = cleanPhone(d);
  if (v.length <= 2) return v;
  if (v.length <= 6) return `(${v.slice(0, 2)}) ${v.slice(2)}`;
  if (v.length <= 10) return `(${v.slice(0, 2)}) ${v.slice(2, 6)}-${v.slice(6)}`;
  return `(${v.slice(0, 2)}) ${v.slice(2, 7)}-${v.slice(7, 11)}`;
}

export function formatCep(d: string) {
  const v = String(d ?? "").replace(/\D/g, "").slice(0, 8);
  return v.length > 5 ? `${v.slice(0, 5)}-${v.slice(5)}` : v;
}

export function titleCase(name: string) {
  return name
    .trim()
    .replace(/\s+/g, " ")
    .split(" ")
    .map((w) => (w.length > 2 || w === w.toUpperCase() ? w[0]?.toUpperCase() + w.slice(1).toLowerCase() : w.toLowerCase()))
    .join(" ");
}
