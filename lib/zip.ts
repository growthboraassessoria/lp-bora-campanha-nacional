// Resolução de ZIP code (EUA): tabela própria em data/us-zips.tsv (GeoNames, CC BY 4.0), com o Zippopotam
// como reserva para códigos que a tabela ainda não tem. Devolve cidade, estado (ISO: "US-TX") e a posição.
import "server-only";
import { readFileSync } from "node:fs";
import path from "node:path";
import { slugify } from "./geo";
import { US_STATE_NAMES } from "./geo/us-names";

export type ZipResult = {
  zip: string;
  city: string;
  /** Estado no padrão do banco: "US-TX". */
  uf: string;
  stateName: string;
  slug: string;
  lat: number;
  lng: number;
  approx: boolean;
  source: "geonames" | "zippopotam";
};

let table: Map<string, string> | null = null;

function load(): Map<string, string> {
  if (table) return table;
  const t = new Map<string, string>();
  try {
    const text = readFileSync(path.join(process.cwd(), "data/us-zips.tsv"), "utf8");
    for (const line of text.split("\n")) if (line.charCodeAt(5) === 9) t.set(line.slice(0, 5), line.slice(6));
  } catch (e) {
    console.error("[zip] tabela indisponível", e);
  }
  table = t;
  return t;
}

export function normalizeZip(raw: string): string | null {
  const d = String(raw ?? "").replace(/\D/g, "");
  return d.length === 5 ? d : null;
}

/** Slug da cidade americana: `us-<uf>-<cidade>`, por exemplo `us-tx-austin`. */
export function usCitySlug(city: string, stateCode: string) {
  return `us-${stateCode.toLowerCase()}-${slugify(city)}`;
}

function build(zip: string, city: string, st: string, lat: number, lng: number, source: ZipResult["source"]): ZipResult | null {
  const uf = `US-${st.toUpperCase()}`;
  const stateName = US_STATE_NAMES[uf];
  if (!stateName || !city || !Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { zip, city, uf, stateName, slug: usCitySlug(city, st), lat, lng, approx: false, source };
}

export async function resolveZip(raw: string): Promise<ZipResult | null> {
  const zip = normalizeZip(raw);
  if (!zip) return null;
  const hit = load().get(zip);
  if (hit) {
    const [city, st, lat, lng] = hit.split("\t");
    return build(zip, city, st, Number(lat), Number(lng), "geonames");
  }
  try {
    const res = await fetch(`https://api.zippopotam.us/us/${zip}`, { signal: AbortSignal.timeout(3500), next: { revalidate: 86400 } });
    if (!res.ok) return null;
    const d = (await res.json()) as { places?: { "place name"?: string; "state abbreviation"?: string; latitude?: string; longitude?: string }[] };
    const p = d.places?.[0];
    if (!p) return null;
    return build(zip, String(p["place name"] ?? "").trim(), String(p["state abbreviation"] ?? ""), Number(p.latitude), Number(p.longitude), "zippopotam");
  } catch {
    return null;
  }
}
