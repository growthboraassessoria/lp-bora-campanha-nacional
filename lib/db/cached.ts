// Cache curto em memória para os agregados públicos (ranking, totais), por instância do servidor.
import "server-only";
import { getStore } from "./index";
import type { NationalStats, RankingRow, Testimonial } from "./types";

const TTL = 60_000;
const box = new Map<string, { at: number; value: unknown }>();

async function cached<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const hit = box.get(key);
  if (hit && Date.now() - hit.at < TTL) return hit.value as T;
  const value = await fn();
  box.set(key, { at: Date.now(), value });
  return value;
}

export const getNationalStats = () => cached<NationalStats>("stats", () => getStore().nationalStats());
export const getRanking = (limit?: number) => cached<RankingRow[]>(`ranking:${limit ?? "all"}`, () => getStore().ranking(limit ? { limit } : {}));
export const getTestimonials = () => cached<Testimonial[]>("testimonials", () => getStore().testimonials());
export function invalidatePublicCache() {
  box.clear();
}
