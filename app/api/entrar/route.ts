// Entrada na área do membro: CPF do cadastro + data de nascimento. Mensagem genérica e limite de tentativas.
import { NextResponse } from "next/server";
import { getStore } from "@/lib/db";
import { MESSAGES, cleanCpf, isValidCpf, parseBirthDate } from "@/lib/validation";
import { COOKIE_DAYS, LEAD_COOKIE, signLeadId } from "@/lib/referral";
import { getRequestMeta } from "@/lib/server/session";

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
  if (store.kind === "none") return NextResponse.json({ ok: false, error: MESSAGES.unavailable }, { status: 503 });
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: MESSAGES.generic }, { status: 400 });
  }
  const cpf = cleanCpf(String(body.cpf ?? ""));
  const birth = parseBirthDate(String(body.birth_date ?? ""));
  const meta = await getRequestMeta();
  if (limited(`ip:${meta.ip_hash ?? "anon"}`, 12, 10 * 60_000) || limited(`cpf:${cpf}`, 6, 10 * 60_000)) {
    return NextResponse.json({ ok: false, error: MESSAGES.tooMany }, { status: 429 });
  }
  if (!isValidCpf(cpf) || !birth) return NextResponse.json({ ok: false, error: MESSAGES.login }, { status: 400 });

  const lead = await store.getLeadByCpf(cpf);
  if (!lead || !lead.birth_date || lead.birth_date.slice(0, 10) !== birth) {
    await store.recordEvent({ name: "login_failed", path: "/entrar", ip_hash: meta.ip_hash, user_agent: meta.user_agent });
    return NextResponse.json({ ok: false, error: MESSAGES.login }, { status: 401 });
  }
  await store.touchLogin(lead.id);
  await store.recordEvent({ name: "login", lead_id: lead.id, path: "/entrar", ip_hash: meta.ip_hash, user_agent: meta.user_agent });
  const res = NextResponse.json({ ok: true, redirect: "/eu" });
  res.cookies.set(LEAD_COOKIE, signLeadId(lead.id), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: COOKIE_DAYS * 24 * 60 * 60 });
  return res;
}
