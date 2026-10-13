// Código postal → cidade, no país pedido: CEP (BrasilAPI e ViaCEP) no Brasil, ZIP code (tabela própria) nos EUA.
import "server-only";
import { resolveCep } from "@/lib/cep";
import { resolveZip } from "@/lib/zip";
import type { Locale } from "@/lib/locale";

export type Place = { postal: string; city: string; uf: string; slug: string; lat: number; lng: number; approx: boolean; ibge: string | null; stateName: string | null };

export async function resolvePostal(locale: Locale, raw: string): Promise<Place | null> {
  if (locale === "us") {
    const z = await resolveZip(raw);
    return z ? { postal: z.zip, city: z.city, uf: z.uf, slug: z.slug, lat: z.lat, lng: z.lng, approx: z.approx, ibge: null, stateName: z.stateName } : null;
  }
  const c = await resolveCep(raw);
  return c ? { postal: c.cep, city: c.city, uf: c.uf, slug: c.slug, lat: c.lat, lng: c.lng, approx: c.approx, ibge: c.ibge, stateName: null } : null;
}
