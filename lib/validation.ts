// Validação do cadastro. As mensagens seguem o tom da marca e são as mesmas no cliente e no servidor.
// Brasil: CEP de 8 dígitos, telefone com DDD, CPF e data DD/MM/AAAA. EUA: ZIP de 5 dígitos, celular de 10 dígitos
// (guardado como +1XXXXXXXXXX), sem CPF e data MM/DD/AAAA.
import type { Locale } from "./locale";

export const MESSAGES = {
  cep: "Não achamos esse CEP. Confira os 8 dígitos.",
  phone: "Coloque o DDD e o número.",
  email: "Confere o e-mail? Parece que falta alguma coisa.",
  firstName: "Como a gente te chama?",
  lastName: "E o sobrenome?",
  consent: "Precisamos do seu aceite para seguir.",
  sex: "Marca uma opção.",
  birthDate: "Confere a data de nascimento? Use dia/mês/ano.",
  cpf: "Confere o CPF? Os dígitos não batem.",
  instagram: "Confere o @? Só letras, números, ponto e sublinhado.",
  bio: "Até 140 caracteres.",
  photo: "Não deu para usar essa foto. Tenta uma imagem JPG ou PNG menor.",
  login: "CPF ou data de nascimento não conferem.",
  survey: "Não encontramos esse CPF no movimento. Confere os números ou faz o cadastro.",
  tooMany: "Muitas tentativas. Espera uns minutos e tenta de novo.",
  existing: "Você já está no movimento.",
  generic: "Deu ruim por aqui. Tenta de novo em alguns segundos.",
  unavailable: "O cadastro está fechado neste momento. Tenta de novo mais tarde.",
};

export const MESSAGES_US: typeof MESSAGES = {
  cep: "We couldn't find that ZIP code. Check the 5 digits.",
  phone: "Enter your 10-digit mobile number.",
  email: "Check your email? Something's missing.",
  firstName: "What should we call you?",
  lastName: "And your last name?",
  consent: "We need your OK to continue.",
  sex: "Pick one.",
  birthDate: "Check your date of birth? Use month/day/year.",
  cpf: "",
  instagram: "Check your handle? Letters, numbers, periods, and underscores only.",
  bio: "Up to 140 characters.",
  photo: "We couldn't use that photo. Try a smaller JPG or PNG.",
  login: "That mobile number and date of birth don't match.",
  survey: "",
  tooMany: "Too many tries. Wait a few minutes and try again.",
  existing: "You're already in.",
  generic: "Something went wrong on our end. Try again in a few seconds.",
  unavailable: "Sign-ups are closed right now. Try again later.",
};

export function messagesFor(locale: Locale = "br") {
  return locale === "us" ? MESSAGES_US : MESSAGES;
}

export type LeadFields = {
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  cep: string;
  sex: string;
  birth_date: string;
  cpf: string;
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

/** Celular americano: só os 10 dígitos, sem o 1 do país (códigos de área nunca começam com 1). */
export function cleanPhoneUs(v: string) {
  let d = String(v ?? "").replace(/\D/g, "");
  if (d.startsWith("1")) d = d.slice(1);
  return d.slice(0, 10);
}

export function isValidPhoneUs(v: string) {
  const d = cleanPhoneUs(v);
  return d.length === 10 && /^[2-9]\d{2}[2-9]\d{6}$/.test(d) && !/^(\d)\1+$/.test(d);
}

export function formatPhoneUs(v: string) {
  const d = cleanPhoneUs(v);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

/** Como o telefone é guardado: só dígitos no Brasil, E.164 nos EUA (+1 e os 10 dígitos). Vazio continua vazio. */
export function storedPhone(v: string, locale: Locale = "br") {
  if (locale === "us") {
    const d = cleanPhoneUs(v);
    return d ? `+1${d}` : "";
  }
  return cleanPhone(v);
}

export function isValidPhoneFor(v: string, locale: Locale = "br") {
  return locale === "us" ? isValidPhoneUs(v) : isValidPhone(v);
}

export function formatPhoneFor(v: string, locale: Locale = "br") {
  return locale === "us" ? formatPhoneUs(v) : formatPhone(v);
}

export function isValidEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v ?? "").trim());
}

export const SEX_VALUES = ["F", "M", "N"] as const;

export function cleanCpf(v: string) {
  return String(v ?? "").replace(/\D/g, "").slice(0, 11);
}

/** Valida os dois dígitos verificadores e rejeita sequências repetidas. */
export function isValidCpf(v: string) {
  const d = cleanCpf(v);
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;
  const dv = (len: number) => {
    let s = 0;
    for (let i = 0; i < len; i++) s += Number(d[i]) * (len + 1 - i);
    const r = (s * 10) % 11;
    return r === 10 ? 0 : r;
  };
  return dv(9) === Number(d[9]) && dv(10) === Number(d[10]);
}

export function formatCpf(v: string) {
  const d = cleanCpf(v);
  let out = d.slice(0, 3);
  if (d.length > 3) out += "." + d.slice(3, 6);
  if (d.length > 6) out += "." + d.slice(6, 9);
  if (d.length > 9) out += "-" + d.slice(9, 11);
  return out;
}

/** Máscara DD/MM/AAAA enquanto a pessoa digita. */
export function formatDateInput(v: string) {
  const d = String(v ?? "").replace(/\D/g, "").slice(0, 8);
  let out = d.slice(0, 2);
  if (d.length > 2) out += "/" + d.slice(2, 4);
  if (d.length > 4) out += "/" + d.slice(4, 8);
  return out;
}

/** Aceita DD/MM/AAAA ou AAAA-MM-DD. Devolve AAAA-MM-DD se for uma data real e plausível (da idade mínima a 110 anos). */
export function parseBirthDate(v: string, minAge = 10): string | null {
  const s = String(v ?? "").trim();
  let y: number, m: number, d: number;
  let mt = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (mt) {
    d = Number(mt[1]); m = Number(mt[2]); y = Number(mt[3]);
  } else {
    mt = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!mt) return null;
    y = Number(mt[1]); m = Number(mt[2]); d = Number(mt[3]);
  }
  const dt = new Date(Date.UTC(y, m - 1, d));
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== m - 1 || dt.getUTCDate() !== d) return null;
  const now = new Date();
  const before = now.getUTCMonth() + 1 < m || (now.getUTCMonth() + 1 === m && now.getUTCDate() < d);
  const age = now.getUTCFullYear() - y - (before ? 1 : 0);
  if (age < minAge || age > 110) return null;
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

/** Idade mínima do cadastro nos EUA: a campanha não é dirigida a menores de 13 anos (COPPA). */
export const US_MIN_AGE = 13;

/** Aceita MM/DD/AAAA (EUA) ou AAAA-MM-DD. Devolve AAAA-MM-DD com as mesmas regras de `parseBirthDate`. */
export function parseBirthDateUs(v: string): string | null {
  const s = String(v ?? "").trim();
  const mt = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  return parseBirthDate(mt ? `${mt[3]}-${mt[1]}-${mt[2]}` : s, US_MIN_AGE);
}

export function parseBirthDateFor(v: string, locale: Locale = "br") {
  return locale === "us" ? parseBirthDateUs(v) : parseBirthDate(v);
}

export function formatZip(v: string) {
  return String(v ?? "").replace(/\D/g, "").slice(0, 5);
}

export function formatPostal(v: string, locale: Locale = "br") {
  return locale === "us" ? formatZip(v) : formatCep(v);
}

export function cleanInstagram(v: string) {
  return String(v ?? "")
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\/(www\.)?instagram\.com\//, "")
    .replace(/^@/, "")
    .replace(/[\/?#].*$/, "");
}

export function isValidInstagram(handle: string) {
  return /^[a-z0-9._]{1,30}$/.test(handle);
}

export type ProfileFields = { first_name: string; last_name: string; phone: string; phone2: string; email: string; instagram: string; bio: string };
export type ProfileErrors = Partial<Record<keyof ProfileFields | "cep" | "photo", string>>;

export function validateProfile(f: ProfileFields, locale: Locale = "br"): ProfileErrors {
  const M = messagesFor(locale);
  const e: ProfileErrors = {};
  if (!f.first_name || f.first_name.trim().length < 2 || f.first_name.length > 40) e.first_name = M.firstName;
  if (!f.last_name || f.last_name.trim().length < 1 || f.last_name.length > 60) e.last_name = M.lastName;
  if (!isValidPhoneFor(f.phone, locale)) e.phone = M.phone;
  if (String(f.phone2 ?? "").replace(/\D/g, "") && !isValidPhoneFor(f.phone2, locale)) e.phone2 = M.phone;
  if (!isValidEmail(f.email)) e.email = M.email;
  const ig = cleanInstagram(f.instagram);
  if (ig && !isValidInstagram(ig)) e.instagram = M.instagram;
  if (f.bio && f.bio.length > 140) e.bio = M.bio;
  return e;
}

export function validateLead(f: LeadFields, locale: Locale = "br"): FieldErrors {
  const M = messagesFor(locale);
  const e: FieldErrors = {};
  if (!f.first_name || f.first_name.trim().length < 2 || f.first_name.length > 40) e.first_name = M.firstName;
  if (!f.last_name || f.last_name.trim().length < 1 || f.last_name.length > 60) e.last_name = M.lastName;
  if (!isValidPhoneFor(f.phone, locale)) e.phone = M.phone;
  if (!isValidEmail(f.email)) e.email = M.email;
  const postal = String(f.cep ?? "").replace(/\D/g, "");
  if (!(locale === "us" ? /^\d{5}$/ : /^\d{8}$/).test(postal)) e.cep = M.cep;
  if (!(SEX_VALUES as readonly string[]).includes(f.sex)) e.sex = M.sex;
  if (!parseBirthDateFor(f.birth_date, locale)) e.birth_date = M.birthDate;
  if (locale !== "us" && !isValidCpf(f.cpf)) e.cpf = M.cpf;
  if (!f.privacy_consent) e.privacy_consent = M.consent;
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
