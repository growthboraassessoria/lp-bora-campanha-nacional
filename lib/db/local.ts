// Armazenamento local em arquivo, só para desenvolvimento (sem Supabase configurado).
// Grava em .data/db.json na raiz do projeto. Lê o arquivo a cada chamada, porque em desenvolvimento
// as rotas de API e as páginas podem rodar em instâncias diferentes do módulo. Nunca usado em produção.
import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { CITY_GOAL, FOUNDER_SLOTS } from "./types";
import type { City, EventInput, Lead, NationalStats, NewLeadInput, RankingRow, ReferralClickInput, Store, Testimonial } from "./types";

type Data = {
  cities: City[];
  leads: (Lead & { ip_hash?: string | null; user_agent?: string | null })[];
  clicks: (ReferralClickInput & { id: string; created_at: string })[];
  events: (EventInput & { id: string; created_at: string })[];
  founders: { lead_id: string; city_slug: string; founder_number: number; status: string; created_at: string }[];
  qualification: { lead_id: string; question: string; answer: string; created_at: string }[];
  states: { uf: string; whatsapp_url: string | null }[];
  testimonials: (Testimonial & { approved: boolean })[];
};

const FILE = path.join(process.cwd(), ".data", "db.json");
const empty = (): Data => ({ cities: [], leads: [], clicks: [], events: [], founders: [], qualification: [], states: [], testimonials: [] });

let queue: Promise<unknown> = Promise.resolve();

async function read(): Promise<Data> {
  let d: Data;
  try {
    d = { ...empty(), ...JSON.parse(await fs.readFile(FILE, "utf8")) };
  } catch {
    return empty();
  }
  // Cadastros antigos (antes do BORA ID) recebem número pela ordem de chegada.
  let next = Math.max(0, ...d.leads.map((l) => l.bora_number ?? 0)) + 1;
  for (const l of [...d.leads].sort((a, b) => a.created_at.localeCompare(b.created_at))) {
    if (!l.bora_number) l.bora_number = next++;
    if (!l.external_ids) l.external_ids = {};
  }
  return d;
}

function write<T>(mutate: (d: Data) => T | Promise<T>): Promise<T> {
  const run = queue.then(async () => {
    const d = await read();
    const result = await mutate(d);
    await fs.mkdir(path.dirname(FILE), { recursive: true });
    await fs.writeFile(FILE, JSON.stringify(d, null, 1));
    return result;
  });
  queue = run.catch(() => undefined);
  return run;
}

function rows(d: Data, uf?: string): RankingRow[] {
  const byCity = new Map<string, number>();
  for (const l of d.leads) byCity.set(l.city_slug, (byCity.get(l.city_slug) ?? 0) + 1);
  const founders = new Map<string, number>();
  for (const f of d.founders) if (f.status === "active") founders.set(f.city_slug, (founders.get(f.city_slug) ?? 0) + 1);
  return d.cities
    .filter((c) => (byCity.get(c.slug) ?? 0) > 0 && (!uf || c.uf === uf))
    .map((c) => {
      const leads = byCity.get(c.slug) ?? 0;
      const f = founders.get(c.slug) ?? 0;
      return { rank: 0, slug: c.slug, name: c.name, uf: c.uf, lat: c.lat, lng: c.lng, leads, founders: f, pct: Math.min(100, Math.round((leads / CITY_GOAL) * 100)), founder_slots_left: Math.max(0, FOUNDER_SLOTS - f) };
    })
    .sort((a, b) => b.leads - a.leads || a.name.localeCompare(b.name, "pt"))
    .map((r, i) => ({ ...r, rank: i + 1 }));
}

export const localStore: Store = {
  kind: "local",
  async upsertCity(city) {
    await write((d) => {
      const i = d.cities.findIndex((c) => c.slug === city.slug);
      if (i >= 0) d.cities[i] = { ...d.cities[i], ...city, approx_location: d.cities[i].approx_location && city.approx_location };
      else d.cities.push(city);
    });
    return city;
  },
  async createLead(input) {
    const phone = input.phone.replace(/\D/g, "");
    const email = input.email.trim().toLowerCase();
    return write((d) => {
      const cpf = input.cpf ? input.cpf.replace(/\D/g, "") : null;
      const existing = d.leads.find((l) => l.phone === phone || l.email === email || (cpf && l.cpf === cpf));
      if (existing) return { lead: existing as Lead, created: false };
      const bora_number = Math.max(0, ...d.leads.map((l) => l.bora_number ?? 0)) + 1;
      const lead: Lead = { ...input, id: randomUUID(), bora_number, external_ids: {}, phone, email, cpf, created_at: new Date().toISOString() };
      d.leads.push(lead);
      return { lead, created: true };
    });
  },
  async getLeadById(id) {
    return (await read()).leads.find((l) => l.id === id) ?? null;
  },
  async getLeadByCode(code) {
    return (await read()).leads.find((l) => l.referral_code === code) ?? null;
  },
  async codeExists(code) {
    return (await read()).leads.some((l) => l.referral_code === code);
  },
  async recordReferralClick(input) {
    await write((d) => {
      d.clicks.push({ ...input, id: randomUUID(), created_at: new Date().toISOString() });
    });
  },
  async recordEvent(input) {
    await write((d) => {
      d.events.push({ ...input, id: randomUUID(), created_at: new Date().toISOString() });
      if (d.events.length > 20000) d.events.splice(0, d.events.length - 20000);
    });
  },
  async nationalStats(): Promise<NationalStats> {
    const d = await read();
    return { leads: d.leads.length, cities: new Set(d.leads.map((l) => l.city_slug)).size, states: new Set(d.leads.map((l) => l.state)).size };
  },
  async ranking(opts = {}) {
    const r = rows(await read(), opts.uf);
    return opts.limit ? r.slice(0, opts.limit) : r;
  },
  async cityStat(slug) {
    return rows(await read()).find((r) => r.slug === slug) ?? null;
  },
  async getCity(slug) {
    return (await read()).cities.find((c) => c.slug === slug) ?? null;
  },
  async stateGroupUrl(uf) {
    return (await read()).states.find((s) => s.uf === uf)?.whatsapp_url ?? null;
  },
  async saveQualification(leadId, answers) {
    await write((d) => {
      const now = new Date().toISOString();
      for (const [question, answer] of Object.entries(answers)) {
        if (!answer) continue;
        d.qualification = d.qualification.filter((q) => !(q.lead_id === leadId && q.question === question));
        d.qualification.push({ lead_id: leadId, question, answer, created_at: now });
      }
    });
  },
  async referralStats(code) {
    const d = await read();
    const direct = d.leads.filter((l) => l.referred_by === code);
    let network = direct.length;
    let frontier = direct.map((l) => l.referral_code);
    while (frontier.length) {
      const next = d.leads.filter((l) => l.referred_by && frontier.includes(l.referred_by));
      network += next.length;
      frontier = next.map((l) => l.referral_code);
    }
    return { clicks: d.clicks.filter((c) => c.referral_code === code).length, signups: direct.length, network };
  },
  async testimonials() {
    return (await read()).testimonials.filter((t) => t.approved).map(({ approved: _a, ...t }) => t);
  },
};
