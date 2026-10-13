// Link curto de indicação: registra o clique, guarda o código e a atribuição em cookies e leva para a home.
import { NextResponse } from "next/server";
import { getStore } from "@/lib/db";
import { COOKIE_DAYS, FIRST_TOUCH_COOKIE, LAST_TOUCH_COOKIE, REF_COOKIE, isValidCode, utmFromParams, utmFromTouch } from "@/lib/referral";
import { getRequestMeta } from "@/lib/server/session";
import { LOCALES, localeOfLead } from "@/lib/locale";

export const runtime = "nodejs";

export async function GET(req: Request, ctx: { params: Promise<{ codigo: string }> }) {
  const { codigo } = await ctx.params;
  const code = String(codigo ?? "").toUpperCase();
  const url = new URL(req.url);
  let target = new URL("/", url);
  for (const [k, v] of url.searchParams) target.searchParams.set(k, v);

  if (!isValidCode(code)) return NextResponse.redirect(target, 302);

  const store = getStore();
  const meta = await getRequestMeta();
  const touch = utmFromParams(url.searchParams);
  touch.ref = code;
  touch.ts = new Date().toISOString();
  touch.path = `/r/${code}`;

  try {
    const owner = await store.getLeadByCode(code);
    // O link leva para a campanha do país de quem indicou: um membro dos EUA manda os amigos para /us.
    const cfg = LOCALES[owner ? localeOfLead(owner) : "br"];
    if (cfg.locale !== "br") {
      target = new URL(cfg.routes.home, url);
      for (const [k, v] of url.searchParams) target.searchParams.set(k, v);
    }
    const site_id = cfg.locale === "br" ? null : cfg.siteId;
    await store.recordReferralClick({ referral_code: code, owner_lead_id: owner?.id ?? null, ip_hash: meta.ip_hash, user_agent: meta.user_agent, utm: utmFromTouch(touch), site_id });
    await store.recordEvent({ name: "referral_click", referral_code: code, path: `/r/${code}`, utm: utmFromTouch(touch), ip_hash: meta.ip_hash, user_agent: meta.user_agent, props: { known: !!owner }, site_id });
  } catch (e) {
    console.error("[referral]", e);
  }

  target.searchParams.set("ref", code);
  const res = NextResponse.redirect(target, 302);
  const base = { path: "/", sameSite: "lax" as const, maxAge: COOKIE_DAYS * 24 * 60 * 60 };
  const json = JSON.stringify(touch);
  res.cookies.set(REF_COOKIE, code, base);
  res.cookies.set(LAST_TOUCH_COOKIE, json, base);
  if (!req.headers.get("cookie")?.includes(`${FIRST_TOUCH_COOKIE}=`)) res.cookies.set(FIRST_TOUCH_COOKIE, json, base);
  return res;
}
