import { NextResponse } from "next/server";
import { getStore } from "@/lib/db";
import { resolveCep } from "@/lib/cep";
import { MESSAGES, cleanCpf, cleanPhone, parseBirthDate, titleCase, validateLead } from "@/lib/validation";
import type { Sex } from "@/lib/db";
import { COOKIE_DAYS, LEAD_COOKIE, isValidCode, makeCode, signLeadId, utmFromTouch } from "@/lib/referral";
import { getAttribution, getRequestMeta } from "@/lib/server/session";
import { unitBlocking } from "@/lib/geo/units";
import { SITE, FORM, fill } from "@/lib/copy";

export const runtime = "nodejs";

// Limite simples por IP (por instância). Em produção, o Turnstile é a proteção principal.
const hits = new Map<string, number[]>();
function limited(key: string, max = 12, windowMs = 60_000) {
  const now = Date.now();
  const arr = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  arr.push(now);
  hits.set(key, arr);
  return arr.length > max;
}

async function verifyTurnstile(token: string | undefined, ip: string | null) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  if (!token) return false;
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret, response: token, remoteip: ip ?? undefined }),
    });
    const data = (await res.json()) as { success?: boolean };
    return !!data.success;
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  const store = getStore();
  if (store.kind === "none") return NextResponse.json({ ok: false, error: MESSAGES.unavailable }, { status: 503 });

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: MESSAGES.generic }, { status: 400 });
  }

  // Campo-armadilha: robôs preenchem, pessoas não veem.
  if (typeof body.website === "string" && body.website.trim()) return NextResponse.json({ ok: true, created: true, redirect: "/obrigado" });

  const meta = await getRequestMeta();
  if (limited(meta.ip_hash ?? "anon")) return NextResponse.json({ ok: false, error: MESSAGES.generic }, { status: 429 });

  const rawIp = meta.ip_hash ? null : null;
  if (!(await verifyTurnstile(typeof body.turnstile === "string" ? body.turnstile : undefined, rawIp))) {
    return NextResponse.json({ ok: false, error: MESSAGES.generic }, { status: 400 });
  }

  const fields = {
    first_name: titleCase(String(body.first_name ?? "")),
    last_name: titleCase(String(body.last_name ?? "")),
    phone: cleanPhone(String(body.phone ?? "")),
    email: String(body.email ?? "").trim().toLowerCase(),
    cep: String(body.cep ?? "").replace(/\D/g, ""),
    sex: String(body.sex ?? "").trim().toUpperCase(),
    birth_date: String(body.birth_date ?? "").trim(),
    cpf: cleanCpf(String(body.cpf ?? "")),
    privacy_consent: body.privacy_consent === true,
    marketing_consent: body.marketing_consent !== false,
  };
  const errors = validateLead(fields);
  if (Object.keys(errors).length) return NextResponse.json({ ok: false, errors }, { status: 400 });

  const cep = await resolveCep(fields.cep);
  if (!cep) return NextResponse.json({ ok: false, errors: { cep: MESSAGES.cep } }, { status: 400 });
  const unit = unitBlocking(cep.slug, cep.uf, fields.cep);
  if (unit) return NextResponse.json({ ok: false, unit: { slug: unit.slug, city: unit.city, uf: unit.uf, url: unit.url ?? SITE.studentUrl }, error: fill(FORM.unit.title, { city: cep.city }) }, { status: 409 });

  try {
    await store.upsertCity({ slug: cep.slug, name: cep.city, uf: cep.uf, ibge: cep.ibge, lat: cep.lat, lng: cep.lng, approx_location: cep.approx });

    const attr = await getAttribution();
    const bodyRef = typeof body.ref === "string" ? body.ref.toUpperCase() : null;
    const refCandidate = attr.ref ?? (isValidCode(bodyRef) ? bodyRef : null);
    const referred_by = refCandidate && (await store.codeExists(refCandidate)) ? refCandidate : null;

    let referral_code = makeCode(fields.first_name);
    for (let i = 0; i < 6 && (await store.codeExists(referral_code)); i++) referral_code = makeCode(fields.first_name);

    const { lead, created } = await store.createLead({
      ...fields,
      sex: fields.sex as Sex,
      birth_date: parseBirthDate(fields.birth_date),
      cpf: fields.cpf,
      city_slug: cep.slug,
      city: cep.city,
      state: cep.uf,
      referral_code,
      referred_by,
      utm: utmFromTouch(attr.last ?? attr.first),
      first_touch: attr.first,
      last_touch: attr.last,
      experiment: attr.experiment,
      ip_hash: meta.ip_hash,
      user_agent: meta.user_agent,
    });

    const common = { lead_id: lead.id, path: "/", utm: utmFromTouch(attr.last ?? attr.first), ip_hash: meta.ip_hash, user_agent: meta.user_agent };
    if (created) {
      await store.recordEvent({ ...common, name: "form_completed", props: { city: lead.city, uf: lead.state, variant: attr.experiment.hero, referred: !!referred_by } });
      if (referred_by) await store.recordEvent({ ...common, name: "referred_signup", referral_code: referred_by, props: { city: lead.city } });
    } else {
      await store.recordEvent({ ...common, name: "form_existing", props: { city: lead.city } });
    }

    const res = NextResponse.json({
      ok: true,
      created,
      redirect: "/obrigado",
      message: created ? null : MESSAGES.existing,
      lead: { first_name: lead.first_name, city: lead.city, state: lead.state, city_slug: lead.city_slug, code: lead.referral_code, bora_number: lead.bora_number },
    });
    res.cookies.set(LEAD_COOKIE, signLeadId(lead.id), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: COOKIE_DAYS * 24 * 60 * 60 });
    return res;
  } catch (e) {
    console.error("[lead]", e);
    return NextResponse.json({ ok: false, error: MESSAGES.generic }, { status: 500 });
  }
}
