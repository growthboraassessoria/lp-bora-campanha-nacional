// Onde a BORA já está. Fonte: caixa-bora/conhecimento/negocio.md (Alex e site da BORA, set/2026; aulas experimentais, 16/10/2026).
// `scope: "state"` cobre o estado inteiro (DF é uma praça só; em SC a cidade-sede ainda não foi confirmada).
// `trialUrl`: página de aula experimental da praça. Quem digita o CEP ou ZIP dela é levado para lá.
// Praça sem `trialUrl` continua mandando para o site da BORA.
import { isUsSlug, type Locale } from "../locale";

export type Unit = { slug: string; city: string; uf: string; lat: number; lng: number; scope: "city" | "state"; label?: string; showLabel?: boolean; labelDy?: number; url?: string; trialUrl?: string };

export const UNITS: Unit[] = [
  { slug: "sp-sao-paulo", city: "São Paulo", uf: "SP", lat: -23.55, lng: -46.63, scope: "city", showLabel: true, trialUrl: "https://boraassessoria.com/aula-experimental-sao-paulo/" },
  { slug: "sp-sao-jose-dos-campos", city: "São José dos Campos", uf: "SP", lat: -23.18, lng: -45.88, scope: "city", trialUrl: "https://boraassessoria.com/aula-experimental-sao-jose-dos-campos/" },
  { slug: "sp-indaiatuba", city: "Indaiatuba", uf: "SP", lat: -23.09, lng: -47.22, scope: "city" },
  { slug: "mg-belo-horizonte", city: "Belo Horizonte", uf: "MG", lat: -19.92, lng: -43.94, scope: "city", showLabel: true },
  { slug: "mg-lagoa-da-prata", city: "Lagoa da Prata", uf: "MG", lat: -20.02, lng: -45.54, scope: "city" },
  { slug: "rj-rio-de-janeiro", city: "Rio de Janeiro", uf: "RJ", lat: -22.91, lng: -43.17, scope: "city", showLabel: true },
  { slug: "sc-florianopolis", city: "Florianópolis", uf: "SC", lat: -27.59, lng: -48.55, scope: "state", label: "Santa Catarina", showLabel: true },
  { slug: "rn-natal", city: "Natal", uf: "RN", lat: -5.79, lng: -35.21, scope: "city", showLabel: true, trialUrl: "https://boraassessoria.com/aula-experimental-natal/" },
  { slug: "es-vitoria", city: "Vitória", uf: "ES", lat: -20.32, lng: -40.34, scope: "city", showLabel: true, labelDy: 6 },
  { slug: "pe-recife", city: "Recife", uf: "PE", lat: -8.05, lng: -34.88, scope: "city", showLabel: true, trialUrl: "https://boraassessoria.com/aula-experimental-recife/" },
  { slug: "df-brasilia", city: "Brasília", uf: "DF", lat: -15.78, lng: -47.93, scope: "state", showLabel: true },
  // EUA
  { slug: "us-fl-miami", city: "Miami", uf: "US-FL", lat: 25.77, lng: -80.19, scope: "city", showLabel: true, trialUrl: "https://boraassessoria.com/aula-experimental-miami/" },
];

/** As praças de um país (as dos EUA têm slug `us-`). */
export function unitsOf(locale: Locale): Unit[] {
  return UNITS.filter((u) => isUsSlug(u.slug) === (locale === "us"));
}

/** Link da aula experimental com a origem marcada, para o site da BORA saber que veio da campanha. */
export function trialLink(u: Unit): string | null {
  if (!u.trialUrl) return null;
  const url = new URL(u.trialUrl);
  url.searchParams.set("utm_source", "lp-vamos-em-frente");
  url.searchParams.set("utm_medium", "cep");
  url.searchParams.set("utm_campaign", "aula-experimental");
  return url.toString();
}

/** A unidade que já atende uma cidade (pelo slug `uf-cidade`) ou o estado inteiro, se houver. */
export function unitFor(citySlug: string, uf: string): Unit | null {
  return UNITS.find((u) => u.slug === citySlug) ?? UNITS.find((u) => u.scope === "state" && u.uf === uf) ?? null;
}

/** CEPs liberados para cadastro mesmo em praça com BORA. Só o CEP de teste do Alex (Brasília), 07/10/2026. */
export const UNIT_BYPASS_CEPS = new Set(["72220041"]);

/** A unidade que bloqueia o cadastro para este CEP, ou `null` se a cidade não tem BORA ou o CEP está liberado. */
export function unitBlocking(citySlug: string, uf: string, cep: string): Unit | null {
  if (UNIT_BYPASS_CEPS.has(String(cep ?? "").replace(/\D/g, ""))) return null;
  return unitFor(citySlug, uf);
}
