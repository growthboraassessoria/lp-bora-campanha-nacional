import { NextResponse } from "next/server";
import { resolveCep } from "@/lib/cep";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const cep = new URL(req.url).searchParams.get("cep") ?? "";
  const r = await resolveCep(cep);
  if (!r) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404, headers: { "Cache-Control": "no-store" } });
  return NextResponse.json(
    { ok: true, city: r.city, uf: r.uf, slug: r.slug, lat: r.lat, lng: r.lng, approx: r.approx },
    { headers: { "Cache-Control": "public, max-age=86400, s-maxage=86400" } },
  );
}
