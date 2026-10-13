// Sai da área do membro: apaga o cookie e volta para a campanha (a do país indicado em `?l=us`, ou a do Brasil).
import { NextResponse } from "next/server";
import { LEAD_COOKIE } from "@/lib/referral";
import { LOCALES } from "@/lib/locale";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const url = new URL(req.url);
  const home = LOCALES[url.searchParams.get("l") === "us" ? "us" : "br"].routes.home;
  const res = NextResponse.redirect(new URL(home, url), { status: 303 });
  res.cookies.set(LEAD_COOKIE, "", { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 0 });
  return res;
}
