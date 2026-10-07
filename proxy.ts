// Roda antes das páginas: sorteia a variante do experimento e guarda a atribuição (UTM e código de indicação) em cookies.
import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_DAYS, EXPERIMENT_COOKIE, FIRST_TOUCH_COOKIE, LAST_TOUCH_COOKIE, REF_COOKIE, utmFromParams } from "@/lib/attribution";

const MAX_AGE = COOKIE_DAYS * 24 * 60 * 60;
const base = { path: "/", sameSite: "lax" as const, maxAge: MAX_AGE };

export function proxy(req: NextRequest) {
  const res = NextResponse.next();

  // ?v=A ou ?v=B força a variante (revisão interna); sem isso, sorteio na primeira visita.
  const forced = req.nextUrl.searchParams.get("v");
  if (forced === "A" || forced === "B") {
    res.cookies.set(EXPERIMENT_COOKIE, JSON.stringify({ hero: forced }), { ...base, maxAge: 90 * 24 * 60 * 60 });
  } else if (!req.cookies.get(EXPERIMENT_COOKIE)) {
    const hero = Math.random() < 0.5 ? "A" : "B";
    res.cookies.set(EXPERIMENT_COOKIE, JSON.stringify({ hero }), { ...base, maxAge: 90 * 24 * 60 * 60 });
  }

  const touch = utmFromParams(req.nextUrl.searchParams);
  if (Object.keys(touch).length) {
    touch.ts = new Date().toISOString();
    touch.path = req.nextUrl.pathname;
    const json = JSON.stringify(touch);
    if (!req.cookies.get(FIRST_TOUCH_COOKIE)) res.cookies.set(FIRST_TOUCH_COOKIE, json, base);
    res.cookies.set(LAST_TOUCH_COOKIE, json, base);
    if (touch.ref) res.cookies.set(REF_COOKIE, touch.ref, base);
  }
  return res;
}

export const config = {
  matcher: ["/((?!api|_next|brand|favicon.ico|robots.txt|sitemap.xml).*)"],
};
