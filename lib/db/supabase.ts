// Armazenamento em Supabase. Usa a chave de serviço só no servidor; nenhuma tabela é exposta ao navegador.
// O esquema está em supabase/migrations/0001_init.sql.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { CITY_GOAL, FOUNDER_SLOTS } from "./types";
import type { City, Lead, NationalStats, RankingRow, Store, Testimonial } from "./types";

type LeadRow = {
  id: string; first_name: string; last_name: string; email: string; phone: string; cep: string; city_slug: string; city: string; state: string;
  referral_code: string; referred_by: string | null; privacy_consent: boolean; marketing_consent: boolean;
  utm_source: string | null; utm_medium: string | null; utm_campaign: string | null; utm_content: string | null; utm_term: string | null;
  first_touch: Record<string, string> | null; last_touch: Record<string, string> | null; experiment: Record<string, string> | null; created_at: string;
};

function toLead(r: LeadRow): Lead {
  return {
    id: r.id, first_name: r.first_name, last_name: r.last_name, email: r.email, phone: r.phone, cep: r.cep, city_slug: r.city_slug, city: r.city, state: r.state,
    referral_code: r.referral_code, referred_by: r.referred_by, privacy_consent: r.privacy_consent, marketing_consent: r.marketing_consent,
    utm: { source: r.utm_source, medium: r.utm_medium, campaign: r.utm_campaign, content: r.utm_content, term: r.utm_term },
    first_touch: r.first_touch, last_touch: r.last_touch, experiment: r.experiment, created_at: r.created_at,
  };
}

type StatRow = { slug: string; name: string; uf: string; lat: number; lng: number; leads: number; founders: number };
function toRanking(rows: StatRow[]): RankingRow[] {
  return rows.map((r, i) => ({
    rank: i + 1, slug: r.slug, name: r.name, uf: r.uf, lat: Number(r.lat), lng: Number(r.lng), leads: Number(r.leads), founders: Number(r.founders),
    pct: Math.min(100, Math.round((Number(r.leads) / CITY_GOAL) * 100)), founder_slots_left: Math.max(0, FOUNDER_SLOTS - Number(r.founders)),
  }));
}

export function makeSupabaseStore(url: string, serviceKey: string): Store {
  const db: SupabaseClient = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const fail = (where: string, error: { message: string } | null) => {
    if (error) throw new Error(`${where}: ${error.message}`);
  };
  return {
    kind: "supabase",
    async upsertCity(city) {
      const { error } = await db.from("cities").upsert(
        { slug: city.slug, name: city.name, uf: city.uf, ibge: city.ibge ?? null, lat: city.lat, lng: city.lng, approx_location: city.approx_location },
        { onConflict: "slug", ignoreDuplicates: false },
      );
      fail("cities.upsert", error);
      return city;
    },
    async createLead(input) {
      const phone = input.phone.replace(/\D/g, "");
      const email = input.email.trim().toLowerCase();
      const { data: existing } = await db.from("leads").select("*").or(`phone.eq.${phone},email.eq.${email}`).limit(1).maybeSingle<LeadRow>();
      if (existing) return { lead: toLead(existing), created: false };
      const row = {
        first_name: input.first_name, last_name: input.last_name, email, phone, cep: input.cep, city_slug: input.city_slug, city: input.city, state: input.state,
        referral_code: input.referral_code, referred_by: input.referred_by, privacy_consent: input.privacy_consent, marketing_consent: input.marketing_consent,
        utm_source: input.utm.source ?? null, utm_medium: input.utm.medium ?? null, utm_campaign: input.utm.campaign ?? null, utm_content: input.utm.content ?? null, utm_term: input.utm.term ?? null,
        first_touch: input.first_touch, last_touch: input.last_touch, experiment: input.experiment, ip_hash: input.ip_hash ?? null, user_agent: input.user_agent ?? null,
      };
      const { data, error } = await db.from("leads").insert(row).select("*").single<LeadRow>();
      fail("leads.insert", error);
      return { lead: toLead(data!), created: true };
    },
    async getLeadById(id) {
      const { data } = await db.from("leads").select("*").eq("id", id).maybeSingle<LeadRow>();
      return data ? toLead(data) : null;
    },
    async getLeadByCode(code) {
      const { data } = await db.from("leads").select("*").eq("referral_code", code).maybeSingle<LeadRow>();
      return data ? toLead(data) : null;
    },
    async codeExists(code) {
      const { count } = await db.from("leads").select("id", { count: "exact", head: true }).eq("referral_code", code);
      return (count ?? 0) > 0;
    },
    async recordReferralClick(input) {
      const { error } = await db.from("referral_clicks").insert({
        referral_code: input.referral_code, owner_lead_id: input.owner_lead_id, ip_hash: input.ip_hash ?? null, user_agent: input.user_agent ?? null,
        utm_source: input.utm?.source ?? null, utm_medium: input.utm?.medium ?? null, utm_campaign: input.utm?.campaign ?? null, utm_content: input.utm?.content ?? null, utm_term: input.utm?.term ?? null,
      });
      fail("referral_clicks.insert", error);
    },
    async recordEvent(input) {
      const { error } = await db.from("events").insert({
        name: input.name, lead_id: input.lead_id ?? null, props: input.props ?? {}, path: input.path ?? null, referral_code: input.referral_code ?? null,
        session_id: input.session_id ?? null, ip_hash: input.ip_hash ?? null, user_agent: input.user_agent ?? null,
        utm_source: input.utm?.source ?? null, utm_medium: input.utm?.medium ?? null, utm_campaign: input.utm?.campaign ?? null, utm_content: input.utm?.content ?? null, utm_term: input.utm?.term ?? null,
      });
      fail("events.insert", error);
    },
    async nationalStats(): Promise<NationalStats> {
      const { data } = await db.from("national_stats").select("*").maybeSingle<{ leads: number; cities: number; states: number }>();
      return { leads: Number(data?.leads ?? 0), cities: Number(data?.cities ?? 0), states: Number(data?.states ?? 0) };
    },
    async ranking(opts = {}) {
      let q = db.from("city_stats").select("*").gt("leads", 0).order("leads", { ascending: false }).order("name");
      if (opts.uf) q = q.eq("uf", opts.uf);
      if (opts.limit) q = q.limit(opts.limit);
      const { data } = await q;
      return toRanking((data ?? []) as StatRow[]);
    },
    async cityStat(slug) {
      const all = await this.ranking();
      return all.find((r) => r.slug === slug) ?? null;
    },
    async getCity(slug) {
      const { data } = await db.from("cities").select("*").eq("slug", slug).maybeSingle<City>();
      return data ?? null;
    },
    async stateGroupUrl(uf) {
      const { data } = await db.from("states").select("whatsapp_url").eq("uf", uf).maybeSingle<{ whatsapp_url: string | null }>();
      return data?.whatsapp_url ?? null;
    },
    async saveQualification(leadId, answers) {
      const rows = Object.entries(answers).filter(([, a]) => a).map(([question, answer]) => ({ lead_id: leadId, question, answer }));
      if (!rows.length) return;
      const { error } = await db.from("qualification_answers").insert(rows);
      fail("qualification_answers.insert", error);
    },
    async referralStats(code) {
      const [{ count: clicks }, { data: net }] = await Promise.all([
        db.from("referral_clicks").select("id", { count: "exact", head: true }).eq("referral_code", code),
        db.rpc("referral_network", { code }),
      ]);
      const n = (net as { signups: number; network: number } | null) ?? { signups: 0, network: 0 };
      return { clicks: clicks ?? 0, signups: Number(n.signups ?? 0), network: Number(n.network ?? 0) };
    },
    async testimonials() {
      const { data } = await db.from("testimonials").select("id,name,city,text,photo_url").eq("approved", true).order("created_at", { ascending: false }).limit(12);
      return (data ?? []) as Testimonial[];
    },
  };
}
