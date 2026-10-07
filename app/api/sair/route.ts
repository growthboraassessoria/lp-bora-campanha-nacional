// Sai da área do membro: apaga o cookie e volta para a campanha.
import { NextResponse } from "next/server";
import { LEAD_COOKIE } from "@/lib/referral";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const res = NextResponse.redirect(new URL("/", req.url), { status: 303 });
  res.cookies.set(LEAD_COOKIE, "", { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 0 });
  return res;
}
