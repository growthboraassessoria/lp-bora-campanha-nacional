// Onde a BORA já está. Fonte: páginas de horários do site da BORA, enviadas pelo Alex em 22/10/2026 (lista de locais em caixa-bora/conhecimento/negocio.md).
// Regra do Alex (22/10/2026): cidade com ponto físico da BORA não aceita cadastro; cidade vizinha aceita.
// `scope: "state"` cobre o estado inteiro: só o DF, porque os serviços de CEP devolvem "Brasília" para todas as regiões administrativas.
// `lat`/`lng`: o local principal de treino da cidade (OpenStreetMap), não o centro da cidade.
// `trialUrl`: página de aula experimental da praça. Quem digita o CEP ou ZIP dela é levado para lá.
// Praça sem `trialUrl` continua mandando para o site da BORA.
import { isUsSlug, type Locale } from "../locale";

export type Unit = { slug: string; city: string; uf: string; lat: number; lng: number; scope: "city" | "state"; label?: string; showLabel?: boolean; labelDy?: number; url?: string; trialUrl?: string };

export const UNITS: Unit[] = [
  { slug: "sp-sao-paulo", city: "São Paulo", uf: "SP", lat: -23.5877, lng: -46.6585, scope: "city", showLabel: true, trialUrl: "https://boraassessoria.com/aula-experimental-sao-paulo/" }, // Parque Ibirapuera
  { slug: "sp-sao-jose-dos-campos", city: "São José dos Campos", uf: "SP", lat: -23.1983, lng: -45.8953, scope: "city", trialUrl: "https://boraassessoria.com/aula-experimental-sao-jose-dos-campos/" }, // Parque Vicentina Aranha
  { slug: "sp-indaiatuba", city: "Indaiatuba", uf: "SP", lat: -23.0784, lng: -47.2008, scope: "city" }, // Centro Esportivo do Trabalhador
  { slug: "mg-belo-horizonte", city: "Belo Horizonte", uf: "MG", lat: -19.9731, lng: -43.9428, scope: "city", showLabel: true }, // Praça Lagoa Seca, Belvedere (também Bike Clube Lagoa, Pampulha)
  { slug: "mg-lagoa-santa", city: "Lagoa Santa", uf: "MG", lat: -19.6386, lng: -43.8861, scope: "city" }, // Av. Getúlio Vargas, Várzea
  { slug: "mg-itabira", city: "Itabira", uf: "MG", lat: -19.6358, lng: -43.2086, scope: "city" }, // Praça da Praia
  { slug: "mg-divinopolis", city: "Divinópolis", uf: "MG", lat: -20.1266, lng: -44.8843, scope: "city" }, // FT Training, Rua Pitangui
  { slug: "mg-oliveira", city: "Oliveira", uf: "MG", lat: -20.6926, lng: -44.8268, scope: "city" }, // Prainha, Av. Maracanã
  { slug: "mg-lagoa-da-prata", city: "Lagoa da Prata", uf: "MG", lat: -20.0311, lng: -45.5425, scope: "city" }, // LBS, Rua Dr. Rômulo Amorim
  { slug: "rj-rio-de-janeiro", city: "Rio de Janeiro", uf: "RJ", lat: -22.9791, lng: -43.2126, scope: "city", showLabel: true }, // Lagoa, Clube dos Caiçaras (também Posto 5, Barra)
  { slug: "es-vitoria", city: "Vitória", uf: "ES", lat: -20.2711, lng: -40.276, scope: "city", showLabel: true, labelDy: 6 }, // Praia de Camburi
  { slug: "sc-balneario-camboriu", city: "Balneário Camboriú", uf: "SC", lat: -27.0047, lng: -48.6251, scope: "city", showLabel: true }, // Av. Atlântica com Rua 3300
  { slug: "rn-natal", city: "Natal", uf: "RN", lat: -5.8378, lng: -35.204, scope: "city", showLabel: true, trialUrl: "https://boraassessoria.com/aula-experimental-natal/" }, // UFRN
  { slug: "pe-recife", city: "Recife", uf: "PE", lat: -8.0369, lng: -34.9048, scope: "city", showLabel: true, trialUrl: "https://boraassessoria.com/aula-experimental-recife/" }, // Parque da Jaqueira
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
