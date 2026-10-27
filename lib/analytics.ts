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

/** Google Tag (GA4 G-0KFY4QJ8LT) e pixel da Meta da BORA (Alex, 27/10/2026). Uma variável pública na Vercel, se existir, tem prioridade. */
export const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "GT-M69HCKWM";
export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || "298345730957487";

/** Eventos da LP que viram conversão padrão no GA4 e na Meta. Os outros seguem com o nome da LP. */
const STANDARD: Record<string, { ga: string; meta: string }> = {
  form_completed_client: { ga: "generate_lead", meta: "Lead" },
};

let booted = false;

/** Repassa os eventos da LP ao GA4, à Meta e à Audácia. Chamado uma vez pelo AnalyticsBoot. */
export function bootProviders() {
  if (booted) return;
  booted = true;
  const w = window as unknown as { gtag?: (...a: unknown[]) => void; fbq?: (...a: unknown[]) => void; audaciaTrack?: (n: string, p: EventProps) => void };
  // Os scripts carregam depois da página: confere se cada ferramenta já existe na hora de cada envio.
  // A visualização de página cada ferramenta já conta sozinha (AnalyticsBoot cuida da Meta nas trocas de página).
  registerProvider((n, p) => {
    if (n === "page_view") return;
    const std = STANDARD[n];
    if (typeof w.gtag === "function") w.gtag("event", std?.ga ?? n, p);
    if (typeof w.fbq === "function") {
      if (std) w.fbq("track", std.meta, p);
      else w.fbq("trackCustom", n, p);
    }
    if (typeof w.audaciaTrack === "function") w.audaciaTrack(n, p);
  });
}
