import { NextResponse } from "next/server";
import { getStore } from "@/lib/db";
import { getCurrentLead } from "@/lib/server/session";

export const runtime = "nodejs";

const KEYS = new Set(["runs", "with", "distance", "goal", "open", "intent", "price", "club", "company"]);

export async function POST(req: Request) {
  const lead = await getCurrentLead();
  if (!lead) return NextResponse.json({ ok: false }, { status: 401 });
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
    await store.recordEvent({ name: "qualification_completed", lead_id: lead.id, path: "/obrigado", props: { answers: Object.keys(answers).length } });
  } catch (e) {
    console.error("[qualification]", e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
