// Onde a BORA já está. Fonte: caixa-bora/conhecimento/negocio.md (Alex e site da BORA, set/2026).
// `scope: "state"` cobre o estado inteiro (DF é uma praça só; em SC a cidade-sede ainda não foi confirmada).
export type Unit = { slug: string; city: string; uf: string; lat: number; lng: number; scope: "city" | "state"; label?: string; showLabel?: boolean; labelDy?: number; url?: string };

export const UNITS: Unit[] = [
  { slug: "sp-sao-paulo", city: "São Paulo", uf: "SP", lat: -23.55, lng: -46.63, scope: "city", showLabel: true },
  { slug: "sp-indaiatuba", city: "Indaiatuba", uf: "SP", lat: -23.09, lng: -47.22, scope: "city" },
  { slug: "mg-belo-horizonte", city: "Belo Horizonte", uf: "MG", lat: -19.92, lng: -43.94, scope: "city", showLabel: true },
  { slug: "mg-lagoa-da-prata", city: "Lagoa da Prata", uf: "MG", lat: -20.02, lng: -45.54, scope: "city" },
  { slug: "rj-rio-de-janeiro", city: "Rio de Janeiro", uf: "RJ", lat: -22.91, lng: -43.17, scope: "city", showLabel: true },
  { slug: "sc-florianopolis", city: "Florianópolis", uf: "SC", lat: -27.59, lng: -48.55, scope: "state", label: "Santa Catarina", showLabel: true },
  { slug: "rn-natal", city: "Natal", uf: "RN", lat: -5.79, lng: -35.21, scope: "city", showLabel: true },
  { slug: "es-vitoria", city: "Vitória", uf: "ES", lat: -20.32, lng: -40.34, scope: "city", showLabel: true, labelDy: 6 },
  { slug: "pe-recife", city: "Recife", uf: "PE", lat: -8.05, lng: -34.88, scope: "city", showLabel: true },
  { slug: "df-brasilia", city: "Brasília", uf: "DF", lat: -15.78, lng: -47.93, scope: "state", showLabel: true },
];

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
