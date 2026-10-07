import { NextResponse } from "next/server";
import { getStore } from "@/lib/db";
import { utmFromTouch } from "@/lib/referral";
import { getAttribution, getCurrentLead, getRequestMeta } from "@/lib/server/session";

export const runtime = "nodejs";

const NAME = /^[a-z][a-z0-9_]{2,40}$/;

export async function POST(req: Request) {
  let body: { name?: string; props?: Record<string, unknown>; path?: string; session_id?: string };
  try {
    body = await req.json();
  } catch {
    return new NextResponse(null, { status: 204 });
  }
  if (!body.name || !NAME.test(body.name)) return new NextResponse(null, { status: 204 });
  try {
    const [lead, attr, meta] = await Promise.all([getCurrentLead(), getAttribution(), getRequestMeta()]);
    const props: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(body.props ?? {})) if (["string", "number", "boolean"].includes(typeof v)) props[k] = typeof v === "string" ? v.slice(0, 200) : v;
    await getStore().recordEvent({
      name: body.name,
      lead_id: lead?.id ?? null,
      props,
      path: typeof body.path === "string" ? body.path.slice(0, 200) : null,
      referral_code: attr.ref,
      utm: utmFromTouch(attr.last ?? attr.first),
      session_id: typeof body.session_id === "string" ? body.session_id.slice(0, 64) : null,
      ip_hash: meta.ip_hash,
      user_agent: meta.user_agent,
    });
  } catch (e) {
    console.error("[events]", e);
  }
  return new NextResponse(null, { status: 204 });
}
