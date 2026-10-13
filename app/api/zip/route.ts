// ZIP code → cidade e estado dos EUA, com a posição no mapa. Mesmo formato de resposta de /api/cep.
import { NextResponse } from "next/server";
import { resolveZip } from "@/lib/zip";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const zip = new URL(req.url).searchParams.get("zip") ?? "";
  const r = await resolveZip(zip);
  if (!r) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404, headers: { "Cache-Control": "no-store" } });
  return NextResponse.json(
    { ok: true, city: r.city, uf: r.uf, slug: r.slug, lat: r.lat, lng: r.lng, approx: r.approx },
    { headers: { "Cache-Control": "public, max-age=86400, s-maxage=86400" } },
  );
}
