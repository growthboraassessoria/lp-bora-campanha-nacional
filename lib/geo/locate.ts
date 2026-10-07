// Localização no navegador: descobre o estado pelo contorno (ponto dentro do polígono) e a cidade conhecida mais perto.
// Roda só no cliente; a posição nunca sai do aparelho (o evento de analytics leva apenas a UF).
import { BR_STATES, project } from "./index";

export type NearCity = { slug: string; name: string; uf: string };
export type Located = { lat: number; lng: number; uf: string; near: NearCity | null };

const cache = new Map<string, number[][][]>();

/** Subcaminhos do contorno de um estado como listas de pontos [x, y] no espaço do mapa. */
function polygons(uf: string, d: string): number[][][] {
  const hit = cache.get(uf);
  if (hit) return hit;
  const polys = d
    .split("M")
    .filter((s) => s.trim())
    .map((s) => {
      const nums = s.match(/-?\d+(\.\d+)?/g)?.map(Number) ?? [];
      const pts: number[][] = [];
      for (let i = 0; i + 1 < nums.length; i += 2) pts.push([nums[i], nums[i + 1]]);
      return pts;
    })
    .filter((p) => p.length >= 3);
  cache.set(uf, polys);
  return polys;
}

function inside(poly: number[][], x: number, y: number) {
  let ok = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) ok = !ok;
  }
  return ok;
}

export function ufFromPoint(lat: number, lng: number): string | null {
  const [x, y] = project(lng, lat);
  for (const s of BR_STATES) for (const poly of polygons(s.uf, s.d)) if (inside(poly, x, y)) return s.uf;
  return null;
}

function km(aLat: number, aLng: number, bLat: number, bLng: number) {
  const r = Math.PI / 180;
  const dLat = (bLat - aLat) * r;
  const dLng = (bLng - aLng) * r;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(aLat * r) * Math.cos(bLat * r) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

export function nearestCity(lat: number, lng: number, cities: (NearCity & { lat: number; lng: number })[], maxKm = 40): NearCity | null {
  let best: NearCity | null = null;
  let bestKm = maxKm;
  for (const c of cities) {
    const d = km(lat, lng, c.lat, c.lng);
    if (d < bestKm) {
      bestKm = d;
      best = { slug: c.slug, name: c.name, uf: c.uf };
    }
  }
  return best;
}

/** Estado e, se houver uma cidade conhecida a menos de 40 km, a cidade. `null` fora do Brasil. */
export function locate(lat: number, lng: number, cities: (NearCity & { lat: number; lng: number })[]): Located | null {
  const uf = ufFromPoint(lat, lng);
  if (!uf) return null;
  return { lat, lng, uf, near: nearestCity(lat, lng, cities.filter((c) => c.uf === uf)) };
}
