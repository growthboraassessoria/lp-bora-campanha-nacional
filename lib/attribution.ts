// Atribuição (UTM, código de indicação, experimento) sem dependências de Node: roda no proxy (edge) e no servidor.
import type { Utm } from "./db/types";

export const REF_COOKIE = "bora_ref";
export const LEAD_COOKIE = "bora_lead";
export const FIRST_TOUCH_COOKIE = "bora_first";
export const LAST_TOUCH_COOKIE = "bora_last";
export const EXPERIMENT_COOKIE = "bora_exp";
export const COOKIE_DAYS = 30;

export const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const;

export function utmFromParams(params: URLSearchParams): Record<string, string> {
  const out: Record<string, string> = {};
  for (const k of UTM_KEYS) {
    const v = params.get(k);
    if (v) out[k] = v.slice(0, 120);
  }
  const ref = params.get("ref");
  if (ref && isValidCode(ref.toUpperCase())) out.ref = ref.toUpperCase();
  return out;
}

export function utmFromTouch(t: Record<string, string> | null | undefined): Utm {
  return { source: t?.utm_source ?? null, medium: t?.utm_medium ?? null, campaign: t?.utm_campaign ?? null, content: t?.utm_content ?? null, term: t?.utm_term ?? null };
}

export function parseTouch(raw: string | undefined): Record<string, string> | null {
  if (!raw) return null;
  try {
    const o = JSON.parse(raw);
    return o && typeof o === "object" ? (o as Record<string, string>) : null;
  } catch {
    return null;
  }
}

export function isValidCode(code: string | undefined | null): code is string {
  return !!code && /^[A-Z]{2,10}\d{3}$/.test(code);
}

export type Experiment = { hero: "A" | "B" };

export function parseExperiment(raw: string | undefined): Experiment {
  try {
    const o = raw ? (JSON.parse(raw) as Partial<Experiment>) : {};
    return { hero: o.hero === "B" ? "B" : "A" };
  } catch {
    return { hero: "A" };
  }
}

export function shortLink(code: string): string {
  const domain = process.env.NEXT_PUBLIC_SHORT_DOMAIN || "bora.com.br";
  return `${domain}/r/${code}`;
}

export function absoluteUrl(path: string): string {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  return `${base}${path}`;
}
