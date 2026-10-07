// Tipos do armazenamento da campanha. A implementação pode ser Supabase (produção) ou um arquivo local (desenvolvimento).

export type Utm = {
  source?: string | null;
  medium?: string | null;
  campaign?: string | null;
  content?: string | null;
  term?: string | null;
};

export type City = {
  slug: string;
  name: string;
  uf: string;
  ibge?: string | null;
  lat: number;
  lng: number;
  approx_location: boolean;
};

/** Sexo informado no cadastro: F, M ou N (prefiro não dizer). */
export type Sex = "F" | "M" | "N";

export type Lead = {
  id: string;
  /** BORA ID: número nacional sequencial, a partir de 1. */
  bora_number: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  cep: string;
  sex: Sex | null;
  birth_date: string | null;
  cpf: string | null;
  external_ids: Record<string, string>;
  phone2: string | null;
  instagram: string | null;
  bio: string | null;
  photo_url: string | null;
  public_profile: boolean;
  public_whatsapp: boolean;
  city_slug: string;
  city: string;
  state: string;
  referral_code: string;
  referred_by: string | null;
  privacy_consent: boolean;
  marketing_consent: boolean;
  utm: Utm;
  first_touch: Record<string, string> | null;
  last_touch: Record<string, string> | null;
  experiment: Record<string, string> | null;
  created_at: string;
};

export type NewLeadInput = Omit<Lead, "id" | "created_at" | "bora_number" | "external_ids" | "phone2" | "instagram" | "bio" | "photo_url" | "public_profile" | "public_whatsapp"> & { ip_hash?: string | null; user_agent?: string | null };

/** O que a pessoa pode mudar na área do membro. */
export type ProfilePatch = Partial<Pick<Lead, "first_name" | "last_name" | "phone" | "phone2" | "email" | "instagram" | "bio" | "photo_url" | "public_profile" | "public_whatsapp" | "cep" | "city_slug" | "city" | "state">>;

/** O que a página da cidade mostra de quem ativou o perfil público. */
export type PublicMember = {
  id: string;
  bora_number: number;
  first_name: string;
  last_initial: string;
  city: string;
  city_slug: string;
  state: string;
  instagram: string | null;
  bio: string | null;
  photo_url: string | null;
  whatsapp: string | null;
  created_at: string;
};

export type RankingRow = {
  rank: number;
  slug: string;
  name: string;
  uf: string;
  lat: number;
  lng: number;
  leads: number;
  founders: number;
  pct: number;
  founder_slots_left: number;
};

export type NationalStats = { leads: number; cities: number; states: number };

export type EventInput = {
  name: string;
  lead_id?: string | null;
  props?: Record<string, unknown>;
  path?: string | null;
  referral_code?: string | null;
  utm?: Utm;
  session_id?: string | null;
  ip_hash?: string | null;
  user_agent?: string | null;
};

export type ReferralClickInput = {
  referral_code: string;
  owner_lead_id: string | null;
  ip_hash?: string | null;
  user_agent?: string | null;
  utm?: Utm;
};

export type Testimonial = { id: string; name: string; city: string; text: string; photo_url: string | null };

export type ReferralStats = { clicks: number; signups: number; network: number };

export interface Store {
  readonly kind: "supabase" | "local" | "none";
  upsertCity(city: City): Promise<City>;
  createLead(input: NewLeadInput): Promise<{ lead: Lead; created: boolean }>;
  getLeadById(id: string): Promise<Lead | null>;
  getLeadByCode(code: string): Promise<Lead | null>;
  getLeadByCpf(cpf: string): Promise<Lead | null>;
  updateLead(id: string, patch: ProfilePatch): Promise<Lead>;
  touchLogin(id: string): Promise<void>;
  savePhoto(leadId: string, data: Buffer, contentType: string): Promise<string>;
  publicMembers(citySlug: string, limit?: number): Promise<PublicMember[]>;
  codeExists(code: string): Promise<boolean>;
  recordReferralClick(input: ReferralClickInput): Promise<void>;
  recordEvent(input: EventInput): Promise<void>;
  nationalStats(): Promise<NationalStats>;
  ranking(opts?: { limit?: number; uf?: string }): Promise<RankingRow[]>;
  cityStat(slug: string): Promise<RankingRow | null>;
  getCity(slug: string): Promise<City | null>;
  stateGroupUrl(uf: string): Promise<string | null>;
  saveQualification(leadId: string, answers: Record<string, string>): Promise<void>;
  referralStats(code: string): Promise<ReferralStats>;
  testimonials(): Promise<Testimonial[]>;
}

export const CITY_GOAL = 500;
export const FOUNDER_SLOTS = 50;
