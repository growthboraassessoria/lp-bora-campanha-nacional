"use client";
// Camada de eventos independente de ferramenta. `track` grava no servidor e repassa aos provedores registrados.
// Provedores (GA4, Meta e outros) entram por `registerProvider`, sem tocar nos componentes.

export type EventProps = Record<string, string | number | boolean | null | undefined>;
type Provider = (name: string, props: EventProps) => void;

const providers: Provider[] = [];
const PII = new Set(["email", "phone", "first_name", "last_name", "name", "cep"]);

function sessionId(): string | null {
  try {
    let id = localStorage.getItem("bora_sid");
    if (!id) {
      id = Math.random().toString(36).slice(2) + Date.now().toString(36);
      localStorage.setItem("bora_sid", id);
    }
    return id;
  } catch {
    return null;
  }
}

function clean(props: EventProps): EventProps {
  const out: EventProps = {};
  for (const [k, v] of Object.entries(props)) if (!PII.has(k) && v !== undefined) out[k] = v;
  return out;
}

export function registerProvider(p: Provider) {
  providers.push(p);
}

export function track(name: string, props: EventProps = {}) {
  if (typeof window === "undefined") return;
  const safe = clean(props);
  const body = JSON.stringify({ name, props: safe, path: location.pathname, session_id: sessionId() });
  try {
    if (navigator.sendBeacon) navigator.sendBeacon("/api/events", new Blob([body], { type: "application/json" }));
    else fetch("/api/events", { method: "POST", body, headers: { "Content-Type": "application/json" }, keepalive: true }).catch(() => {});
  } catch {
    /* sem rede, sem drama */
  }
  for (const p of providers) {
    try {
      p(name, safe);
    } catch {
      /* provedor quebrado não derruba a página */
    }
  }
}

/** Liga GA4 e Meta Pixel quando as variáveis públicas existirem. Chamado uma vez pelo AnalyticsBoot. */
export function bootProviders() {
  const w = window as unknown as { gtag?: (...a: unknown[]) => void; fbq?: (...a: unknown[]) => void };
  if (process.env.NEXT_PUBLIC_GA_ID && typeof w.gtag === "function") registerProvider((n, p) => w.gtag!("event", n, p));
  if (process.env.NEXT_PUBLIC_META_PIXEL_ID && typeof w.fbq === "function") registerProvider((n, p) => w.fbq!("trackCustom", n, p));
}
