// Formulário separado de qualificação: acha o cadastro pelo CPF e abre uma sessão curta só para as respostas.
// Não usa o cookie da área do membro.
import { NextResponse } from "next/server";
import { getStore } from "@/lib/db";
import { cleanCpf, isValidCpf, messagesFor } from "@/lib/validation";
import { SURVEY_COOKIE, SURVEY_MAX_AGE, signSurvey } from "@/lib/referral";
import { getRequestMeta, getSurveyLead } from "@/lib/server/session";
import { localeOfLead } from "@/lib/locale";

export const runtime = "nodejs";

const hits = new Map<string, number[]>();
function limited(key: string, max: number, windowMs: number) {
  const now = Date.now();
  const arr = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  arr.push(now);
  hits.set(key, arr);
  return arr.length > max;
}

function surveyCookie(id: string) {
  return [
    SURVEY_COOKIE,
    signSurvey(id),
    {
      httpOnly: true,
      sameSite: "lax" as const,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: SURVEY_MAX_AGE,
    },
  ] as const;
}

export async function GET() {
  const lead = await getSurveyLead();
  if (!lead || localeOfLead(lead) !== "br") return NextResponse.json({ ok: false });
  return NextResponse.json({ ok: true, name: lead.first_name });
}

export async function POST(req: Request) {
  const store = getStore();
  const M = messagesFor("br");
  if (store.kind === "none") return NextResponse.json({ ok: false, error: M.unavailable }, { status: 503 });

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: M.generic }, { status: 400 });
  }

  const cpf = cleanCpf(String(body.cpf ?? ""));
  const meta = await getRequestMeta();
  if (limited(`ip:${meta.ip_hash ?? "anon"}`, 12, 10 * 60_000) || limited(`id:${cpf}`, 6, 10 * 60_000)) {
    return NextResponse.json({ ok: false, error: M.tooMany }, { status: 429 });
  }
  if (!isValidCpf(cpf)) return NextResponse.json({ ok: false, error: M.survey }, { status: 400 });

  const found = await store.getLeadByCpf(cpf);
  const lead = found && localeOfLead(found) === "br" ? found : null;
  if (!lead) {
    await store.recordEvent({ name: "qualification_lookup_failed", path: "/perguntas", ip_hash: meta.ip_hash, user_agent: meta.user_agent, site_id: null });
    return NextResponse.json({ ok: false, error: M.survey }, { status: 404 });
  }

  await store.recordEvent({ name: "qualification_lookup", lead_id: lead.id, path: "/perguntas", ip_hash: meta.ip_hash, user_agent: meta.user_agent, site_id: null });
  const res = NextResponse.json({ ok: true, name: lead.first_name });
  const [name, value, opts] = surveyCookie(lead.id);
  res.cookies.set(name, value, opts);
  return res;
}
