// Os dois países da campanha. Tudo o que muda entre Brasil e EUA mora aqui: rotas, formato de número,
// recursos ligados e como reconhecer de que país é um cadastro. Sem dependência de servidor ou de navegador.
//
// No banco, o país não tem coluna própria: cidade dos EUA tem slug `us-<uf>-<cidade>` e estado no padrão
// ISO 3166-2 (`US-TX`), o que evita colisão com as UFs brasileiras (AL, MA, MS, MT, PA, SC existem nos dois).

export type Locale = "br" | "us";

export type LocaleConfig = {
  locale: Locale;
  country: "BR" | "US";
  lang: string;
  numberLocale: string;
  ogLocale: string;
  /** `site_id` gravado nos cadastros, eventos e cliques (o BORA OS separa as LPs por ele). */
  siteId: string;
  routes: { home: string; signup: string; thanks: string; me: string; login: string; ranking: string; privacy: string; terms: string; founder: string | null; logout: string; city: (slug: string) => string };
  postal: { api: string; param: string; digits: number; maxLength: number };
  features: { founder: boolean; units: boolean; signals: boolean; group: boolean; studentLink: boolean; cpf: boolean; trainingFaq: boolean };
};

export const LOCALES: Record<Locale, LocaleConfig> = {
  br: {
    locale: "br", country: "BR", lang: "pt-BR", numberLocale: "pt-BR", ogLocale: "pt_BR", siteId: "vamos-em-frente",
    routes: { home: "/", signup: "/#cadastro", thanks: "/obrigado", me: "/eu", login: "/entrar", ranking: "/ranking", privacy: "/privacidade", terms: "/termos", founder: "/fundador", logout: "/api/sair", city: (slug) => `/cidade/${slug}` },
    postal: { api: "/api/cep", param: "cep", digits: 8, maxLength: 9 },
    features: { founder: true, units: true, signals: true, group: true, studentLink: true, cpf: true, trainingFaq: true },
  },
  us: {
    locale: "us", country: "US", lang: "en-US", numberLocale: "en-US", ogLocale: "en_US", siteId: "vamos-em-frente-us",
    routes: { home: "/us", signup: "/us#cadastro", thanks: "/us/thanks", me: "/us/me", login: "/us/login", ranking: "/us/ranking", privacy: "/us/privacy", terms: "/us/terms", founder: null, logout: "/api/sair?l=us", city: (slug) => `/us/city/${slug.replace(/^us-/, "")}` },
    postal: { api: "/api/zip", param: "zip", digits: 5, maxLength: 5 },
    features: { founder: false, units: false, signals: false, group: false, studentLink: false, cpf: false, trainingFaq: false },
  },
};

export const isUsSlug = (slug: string | null | undefined) => !!slug && slug.startsWith("us-");
export const isUsState = (uf: string | null | undefined) => !!uf && uf.startsWith("US-");
export const localeOfSlug = (slug: string | null | undefined): Locale => (isUsSlug(slug) ? "us" : "br");
export const localeOfPath = (path: string | null | undefined): Locale => (path === "/us" || !!path?.startsWith("/us/") ? "us" : "br");
/** País de um cadastro, pela cidade dele. */
export const localeOfLead = (lead: { city_slug: string }): Locale => localeOfSlug(lead.city_slug);
/** Sigla do estado como a pessoa lê: "TX" para "US-TX", "GO" para "GO". */
export const ufLabel = (uf: string | null | undefined) => String(uf ?? "").replace(/^US-/, "");
/** Slug completo a partir do trecho da URL americana: "tx-austin" vira "us-tx-austin". */
export const usSlugFromParam = (param: string) => `us-${param.toLowerCase()}`;

export function formatNumber(n: number, locale: Locale = "br") {
  return n.toLocaleString(LOCALES[locale].numberLocale);
}

/** Data curta a partir de ISO, só a parte da data: DD/MM/AAAA no Brasil, MM/DD/AAAA nos EUA. */
export function formatDate(iso: string | null | undefined, locale: Locale = "br") {
  if (!iso) return "";
  const [y, m, d] = iso.slice(0, 10).split("-");
  if (!(d && m && y)) return "";
  return locale === "us" ? `${m}/${d}/${y}` : `${d}/${m}/${y}`;
}
