// Entrada na área do membro. Brasil: CPF do cadastro + data de nascimento. EUA: celular + data de nascimento.
// Mensagem genérica e limite de tentativas por IP e por identificador.
import { NextResponse } from "next/server";
import { getStore } from "@/lib/db";
import { cleanCpf, isValidCpf, isValidPhoneUs, messagesFor, parseBirthDateFor, storedPhone } from "@/lib/validation";
import { COOKIE_DAYS, LEAD_COOKIE, signLeadId } from "@/lib/referral";
import { getRequestMeta } from "@/lib/server/session";
import { LOCALES, localeOfLead, type Locale } from "@/lib/locale";

export const runtime = "nodejs";

const hits = new Map<string, number[]>();
function limited(key: string, max: number, windowMs: number) {
  const now = Date.now();
  const arr = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  arr.push(now);
  hits.set(key, arr);
  return arr.length > max;
}

export async function POST(req: Request) {
  const store = getStore();
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: messagesFor("br").generic }, { status: 400 });
  }
  const locale: Locale = body.country === "US" ? "us" : "br";
  const cfg = LOCALES[locale];
  const M = messagesFor(locale);
  if (store.kind === "none") return NextResponse.json({ ok: false, error: M.unavailable }, { status: 503 });

  const us = locale === "us";
  const id = us ? storedPhone(String(body.phone ?? ""), "us") : cleanCpf(String(body.cpf ?? ""));
  const validId = us ? isValidPhoneUs(String(body.phone ?? "")) : isValidCpf(id);
  const birth = parseBirthDateFor(String(body.birth_date ?? ""), locale);
  const meta = await getRequestMeta();
  if (limited(`ip:${meta.ip_hash ?? "anon"}`, 12, 10 * 60_000) || limited(`id:${id}`, 6, 10 * 60_000)) {
    return NextResponse.json({ ok: false, error: M.tooMany }, { status: 429 });
  }
  if (!validId || !birth) return NextResponse.json({ ok: false, error: M.login }, { status: 400 });

  const found = us ? await store.getLeadByPhone(id) : await store.getLeadByCpf(id);
  // O celular só abre cadastro feito na versão dos EUA; o do Brasil entra com CPF.
  const lead = found && localeOfLead(found) === locale ? found : null;
  const site_id = locale === "br" ? null : cfg.siteId;
  if (!lead || !lead.birth_date || lead.birth_date.slice(0, 10) !== birth) {
    await store.recordEvent({ name: "login_failed", path: cfg.routes.login, ip_hash: meta.ip_hash, user_agent: meta.user_agent, site_id });
    return NextResponse.json({ ok: false, error: M.login }, { status: 401 });
  }
  await store.touchLogin(lead.id);
  await store.recordEvent({ name: "login", lead_id: lead.id, path: cfg.routes.login, ip_hash: meta.ip_hash, user_agent: meta.user_agent, site_id });
  const res = NextResponse.json({ ok: true, redirect: cfg.routes.me });
  res.cookies.set(LEAD_COOKIE, signLeadId(lead.id), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: COOKIE_DAYS * 24 * 60 * 60 });
  return res;
}
