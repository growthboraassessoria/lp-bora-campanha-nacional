// Validação do cadastro. As mensagens seguem o tom da marca e são as mesmas no cliente e no servidor.

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

/** Aceita DD/MM/AAAA ou AAAA-MM-DD. Devolve AAAA-MM-DD se for uma data real e plausível (10 a 110 anos). */
export function parseBirthDate(v: string): string | null {
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
  if (age < 10 || age > 110) return null;
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

export function validateLead(f: LeadFields): FieldErrors {
  const e: FieldErrors = {};
  if (!f.first_name || f.first_name.trim().length < 2 || f.first_name.length > 40) e.first_name = MESSAGES.firstName;
  if (!f.last_name || f.last_name.trim().length < 1 || f.last_name.length > 60) e.last_name = MESSAGES.lastName;
  if (!isValidPhone(f.phone)) e.phone = MESSAGES.phone;
  if (!isValidEmail(f.email)) e.email = MESSAGES.email;
  if (!/^\d{8}$/.test(String(f.cep ?? "").replace(/\D/g, ""))) e.cep = MESSAGES.cep;
  if (!(SEX_VALUES as readonly string[]).includes(f.sex)) e.sex = MESSAGES.sex;
  if (!parseBirthDate(f.birth_date)) e.birth_date = MESSAGES.birthDate;
  if (!isValidCpf(f.cpf)) e.cpf = MESSAGES.cpf;
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
