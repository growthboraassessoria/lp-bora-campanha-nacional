import { NextResponse } from "next/server";
import { getStore } from "@/lib/db";
import { getCurrentLead, getSurveyLead } from "@/lib/server/session";
import { localeOfLead } from "@/lib/locale";

export const runtime = "nodejs";

const KEYS = new Set(["runs", "with", "distance", "goal", "open", "intent", "price", "club", "company"]);

export async function POST(req: Request) {
  // Vale a sessão do /perguntas (CPF) ou a do cadastro, que responde logo depois da página de obrigado.
  const survey = await getSurveyLead();
  const lead = survey ?? (await getCurrentLead());
  if (!lead || localeOfLead(lead) !== "br") return NextResponse.json({ ok: false }, { status: 401 });
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const answers: Record<string, string> = {};
  for (const [k, v] of Object.entries(body)) if (KEYS.has(k) && typeof v === "string" && v.trim()) answers[k] = v.trim().slice(0, 120);
  try {
    const store = getStore();
    await store.saveQualification(lead.id, answers);
    await store.recordEvent({ name: "qualification_completed", lead_id: lead.id, path: survey ? "/perguntas" : "/obrigado", site_id: null, props: { answers: Object.keys(answers).length } });
  } catch (e) {
    console.error("[qualification]", e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
