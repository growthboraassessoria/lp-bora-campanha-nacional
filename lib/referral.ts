// Código de indicação, assinatura do cookie de lead e hash de IP. Só no servidor (usa node:crypto).
import { createHmac, randomInt, timingSafeEqual } from "node:crypto";

export * from "./attribution";

/** Primeiro nome em ASCII maiúsculo (até 8 letras) + 3 dígitos. Ex.: ALEX982 */
export function makeCode(firstName: string): string {
  const base = firstName
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^A-Za-z]/g, "")
    .toUpperCase()
    .slice(0, 8);
  const prefix = base.length >= 2 ? base : "BORA";
  return `${prefix}${String(randomInt(100, 1000))}`;
}

function secret() {
  return process.env.LEAD_COOKIE_SECRET || "dev-secret-troque-em-producao";
}

export function signLeadId(id: string): string {
  const sig = createHmac("sha256", secret()).update(id).digest("base64url").slice(0, 32);
  return `${id}.${sig}`;
}

export function verifyLeadCookie(value: string | undefined): string | null {
  if (!value) return null;
  const i = value.lastIndexOf(".");
  if (i < 0) return null;
  const id = value.slice(0, i);
  const sig = value.slice(i + 1);
  const expected = createHmac("sha256", secret()).update(id).digest("base64url").slice(0, 32);
  if (sig.length !== expected.length) return null;
  return timingSafeEqual(Buffer.from(sig), Buffer.from(expected)) ? id : null;
}

export function hashIp(ip: string | null | undefined): string | null {
  if (!ip) return null;
  return createHmac("sha256", secret()).update(ip).digest("hex").slice(0, 32);
}
