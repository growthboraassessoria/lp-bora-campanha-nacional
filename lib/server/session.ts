// Leitura do lead atual (cookie assinado) e dos cookies de atribuição dentro de Server Components e Route Handlers.
import "server-only";
import { cookies, headers } from "next/headers";
import { getStore } from "@/lib/db";
import type { Lead } from "@/lib/db";
import { EXPERIMENT_COOKIE, FIRST_TOUCH_COOKIE, LAST_TOUCH_COOKIE, LEAD_COOKIE, REF_COOKIE, hashIp, isValidCode, parseExperiment, parseTouch, verifyLeadCookie } from "@/lib/referral";

export async function getCurrentLead(): Promise<Lead | null> {
  const jar = await cookies();
  const id = verifyLeadCookie(jar.get(LEAD_COOKIE)?.value);
  if (!id) return null;
  try {
    return await getStore().getLeadById(id);
  } catch {
    return null;
  }
}

export async function getAttribution() {
  const jar = await cookies();
  const ref = jar.get(REF_COOKIE)?.value?.toUpperCase();
  return {
    ref: isValidCode(ref) ? ref : null,
    first: parseTouch(jar.get(FIRST_TOUCH_COOKIE)?.value),
    last: parseTouch(jar.get(LAST_TOUCH_COOKIE)?.value),
    experiment: parseExperiment(jar.get(EXPERIMENT_COOKIE)?.value),
  };
}

export async function getRequestMeta() {
  const h = await headers();
  const ip = (h.get("x-forwarded-for") ?? "").split(",")[0].trim() || h.get("x-real-ip") || null;
  return { ip_hash: hashIp(ip), user_agent: (h.get("user-agent") ?? "").slice(0, 300) || null };
}
