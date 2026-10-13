// Cache curto em memória para os agregados públicos (ranking, totais), por instância do servidor.
import "server-only";
import { getStore } from "./index";
import type { NationalStats, RankingRow, Testimonial } from "./types";
import type { Locale } from "../locale";

const TTL = 60_000;
const box = new Map<string, { at: number; value: unknown }>();

async function cached<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const hit = box.get(key);
  if (hit && Date.now() - hit.at < TTL) return hit.value as T;
  const value = await fn();
  box.set(key, { at: Date.now(), value });
  return value;
}

/** Ranking completo de um país. Os totais saem dele, para não consultar o banco duas vezes. */
export const getRanking = (country: Locale = "br") => cached<RankingRow[]>(`ranking:${country}`, () => getStore().ranking({ country }));
export async function getNationalStats(country: Locale = "br"): Promise<NationalStats> {
  const rows = await getRanking(country);
  return { leads: rows.reduce((n, r) => n + r.leads, 0), cities: rows.length, states: new Set(rows.map((r) => r.uf)).size };
}
export const getTestimonials = () => cached<Testimonial[]>("testimonials", () => getStore().testimonials());
export function invalidatePublicCache() {
  box.clear();
}
