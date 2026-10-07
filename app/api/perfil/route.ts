// Perfil do membro: dados, telefones, Instagram, linha sobre você, foto, CEP (muda a cidade) e perfil público.
import { NextResponse } from "next/server";
import { getStore } from "@/lib/db";
import type { ProfilePatch } from "@/lib/db";
import { safeLead } from "@/lib/profile";
import { getCurrentLead } from "@/lib/server/session";
import { resolveCep } from "@/lib/cep";
import { unitBlocking } from "@/lib/geo/units";
import { SITE, FORM, fill } from "@/lib/copy";
import { MESSAGES, cleanInstagram, cleanPhone, titleCase, validateProfile } from "@/lib/validation";

export const runtime = "nodejs";

export async function PATCH(req: Request) {
  const lead = await getCurrentLead();
  if (!lead) return NextResponse.json({ ok: false }, { status: 401 });
  const store = getStore();
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: MESSAGES.generic }, { status: 400 });
  }
  const f = {
    first_name: titleCase(String(body.first_name ?? lead.first_name)),
    last_name: titleCase(String(body.last_name ?? lead.last_name)),
    phone: cleanPhone(String(body.phone ?? lead.phone)),
    phone2: cleanPhone(String(body.phone2 ?? "")),
    email: String(body.email ?? lead.email).trim().toLowerCase(),
    instagram: cleanInstagram(String(body.instagram ?? "")),
    bio: String(body.bio ?? "").trim().replace(/\s+/g, " ").slice(0, 140),
  };
  const errors = validateProfile(f);
  if (Object.keys(errors).length) return NextResponse.json({ ok: false, errors }, { status: 400 });

  const patch: ProfilePatch = {
    first_name: f.first_name, last_name: f.last_name, phone: f.phone, phone2: f.phone2 || null, email: f.email, instagram: f.instagram || null, bio: f.bio || null,
    public_profile: body.public_profile === true,
    public_whatsapp: body.public_profile === true && body.public_whatsapp === true,
  };

  const cep = String(body.cep ?? "").replace(/\D/g, "");
  let cityChanged = false;
  if (cep && cep !== lead.cep) {
    if (!/^\d{8}$/.test(cep)) return NextResponse.json({ ok: false, errors: { cep: MESSAGES.cep } }, { status: 400 });
    const r = await resolveCep(cep);
    if (!r) return NextResponse.json({ ok: false, errors: { cep: MESSAGES.cep } }, { status: 400 });
    const unit = unitBlocking(r.slug, r.uf, cep);
    if (unit) return NextResponse.json({ ok: false, unit: { slug: unit.slug, city: unit.city, uf: unit.uf, url: unit.url ?? SITE.studentUrl }, errors: { cep: fill(FORM.unit.title, { city: r.city }) } }, { status: 409 });
    await store.upsertCity({ slug: r.slug, name: r.city, uf: r.uf, ibge: r.ibge, lat: r.lat, lng: r.lng, approx_location: r.approx });
    Object.assign(patch, { cep, city_slug: r.slug, city: r.city, state: r.uf });
    cityChanged = true;
  }

  if (body.photo === null) patch.photo_url = null;
  else if (typeof body.photo === "string" && body.photo.startsWith("data:image/")) {
    const m = body.photo.match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/);
    if (!m) return NextResponse.json({ ok: false, errors: { photo: MESSAGES.photo } }, { status: 400 });
    const buf = Buffer.from(m[2], "base64");
    if (buf.length < 100 || buf.length > 900_000) return NextResponse.json({ ok: false, errors: { photo: MESSAGES.photo } }, { status: 400 });
    try {
      patch.photo_url = await store.savePhoto(lead.id, buf, m[1]);
    } catch (e) {
      console.error("[perfil.foto]", e);
      return NextResponse.json({ ok: false, errors: { photo: MESSAGES.photo } }, { status: 500 });
    }
  }

  try {
    const updated = await store.updateLead(lead.id, patch);
    await store.recordEvent({ name: "profile_saved", lead_id: lead.id, path: "/eu", props: { public: patch.public_profile, whatsapp: patch.public_whatsapp, photo: !!updated.photo_url, instagram: !!updated.instagram, city_changed: cityChanged } });
    return NextResponse.json({ ok: true, lead: safeLead(updated) });
  } catch (e) {
    console.error("[perfil]", e);
    return NextResponse.json({ ok: false, error: MESSAGES.generic }, { status: 500 });
  }
}
