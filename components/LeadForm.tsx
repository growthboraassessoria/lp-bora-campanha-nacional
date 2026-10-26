"use client";
// O painel de cadastro: código postal primeiro, cidade confirmada em letras grandes, depois os dados. Cadastro em ~30 segundos.
// Brasil: CEP, WhatsApp, CPF e um aceite. EUA: ZIP code, celular, sem CPF, e o aceite de mensagens de texto à parte.
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { fill } from "@/lib/copy";
import { ufLabel } from "@/lib/locale";
import { trialLinks, unitBlocking, type Unit } from "@/lib/geo/units";
import { SEEN as WELCOME_SEEN } from "./ThanksWelcome";
import { formatCpf, formatDateInput, formatPhoneFor, formatPostal, messagesFor, validateLead, type FieldErrors } from "@/lib/validation";
import { track } from "@/lib/analytics";
import { gsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/hooks/useGsap";
import { useConfig, useCopy } from "./LocaleProvider";

export type ResolvedCity = { city: string; uf: string; slug: string; lat: number; lng: number; approx: boolean };
type Step = "cep" | "confirm" | "details" | "unit";

type Props = {
  id?: string;
  variant?: "hero" | "final" | "city";
  onCity?: (city: ResolvedCity | null) => void;
  onPlaced?: (city: ResolvedCity) => void;
  cityHint?: string;
};

declare global {
  interface Window {
    turnstile?: { render: (el: HTMLElement, opts: Record<string, unknown>) => string; reset: (id?: string) => void };
  }
}

const TURNSTILE = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

type TextKey = "first_name" | "last_name" | "phone" | "email" | "cpf" | "birth_date";
type TextField = { k: TextKey; type: "text" | "tel" | "email"; mode: "text" | "tel" | "email" | "numeric"; ac: string; placeholder?: string; max?: number; help?: string };

export default function LeadForm({ id = "cadastro", variant = "hero", onCity, onPlaced, cityHint }: Props) {
  const { FORM, SITE } = useCopy();
  const cfg = useConfig();
  const locale = cfg.locale;
  const M = messagesFor(locale);
  const [step, setStep] = useState<Step>("cep");
  const [cep, setCep] = useState("");
  const [cepStatus, setCepStatus] = useState<"idle" | "loading" | "error">("idle");
  const [city, setCity] = useState<ResolvedCity | null>(null);
  const [unit, setUnit] = useState<Unit | null>(null);
  // Quem não é aluno numa praça com mais de uma aula experimental escolhe o local.
  const [unitPick, setUnitPick] = useState(false);
  const [fields, setFields] = useState({ first_name: "", last_name: "", phone: "", email: "", cpf: "", birth_date: "", sex: "" });
  const [consent, setConsent] = useState(false);
  const [sms, setSms] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string>("");
  const started = useRef(false);
  const stepRef = useRef<HTMLDivElement>(null);
  const firstRef = useRef<HTMLInputElement>(null);
  const cepRef = useRef<HTMLInputElement>(null);
  const turnstileRef = useRef<HTMLDivElement>(null);
  const lastCep = useRef("");

  const textFields = useMemo<TextField[]>(() => {
    const list: TextField[] = [
      { k: "first_name", type: "text", mode: "text", ac: "given-name" },
      { k: "last_name", type: "text", mode: "text", ac: "family-name" },
      { k: "phone", type: "tel", mode: "tel", ac: "tel-national", placeholder: FORM.placeholders.phone || undefined, max: locale === "us" ? 14 : 15 },
      { k: "email", type: "email", mode: "email", ac: "email" },
    ];
    if (cfg.features.cpf) list.push({ k: "cpf", type: "text", mode: "numeric", ac: "off", placeholder: FORM.placeholders.cpf, max: 14, help: FORM.cpfHelp });
    list.push({ k: "birth_date", type: "text", mode: "numeric", ac: "bday", placeholder: FORM.placeholders.birth_date, max: 10 });
    return list;
  }, [FORM, cfg.features.cpf, locale]);

  // Cada passo entra com leve subida.
  useEffect(() => {
    if (!stepRef.current || prefersReducedMotion()) return;
    const items = stepRef.current.querySelectorAll<HTMLElement>("[data-step-item]");
    gsap.fromTo(items, { y: 18, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.7, stagger: 0.07, ease: "bora", clearProps: "transform" });
  }, [step]);

  useEffect(() => {
    if (step === "details") setTimeout(() => firstRef.current?.focus(), 150);
  }, [step]);

  // Turnstile (opcional)
  useEffect(() => {
    if (!TURNSTILE || step !== "details" || !turnstileRef.current) return;
    const mount = () => {
      if (window.turnstile && turnstileRef.current && !turnstileRef.current.hasChildNodes()) {
        window.turnstile.render(turnstileRef.current, { sitekey: TURNSTILE, theme: "dark", callback: (t: string) => setTurnstileToken(t) });
      }
    };
    if (window.turnstile) mount();
    else {
      const s = document.createElement("script");
      s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
      s.async = true;
      s.onload = mount;
      document.head.appendChild(s);
    }
  }, [step]);

  const trials = unit ? trialLinks(unit) : [];

  async function resolve(digits: string) {
    if (digits === lastCep.current) return;
    lastCep.current = digits;
    setCepStatus("loading");
    setErrors((e) => ({ ...e, cep: undefined }));
    try {
      const r = await fetch(`${cfg.postal.api}?${cfg.postal.param}=${digits}`);
      if (!r.ok) throw new Error("not_found");
      const d = (await r.json()) as ResolvedCity & { ok: boolean };
      const resolved: ResolvedCity = { city: d.city, uf: d.uf, slug: d.slug, lat: d.lat, lng: d.lng, approx: d.approx };
      setCity(resolved);
      setCepStatus("idle");
      onCity?.(resolved);
      track("cep_resolved", { uf: d.uf, city: d.city, approx: d.approx, variant });
      // Praça onde a BORA já está (só no Brasil): em vez do cadastro, o caminho é o site.
      const u = cfg.features.units ? unitBlocking(d.slug, d.uf, digits) : null;
      setUnitPick(false);
      if (u) {
        setUnit(u);
        setStep("unit");
        track("unit_match", { uf: d.uf, city: d.city, unit: u.slug, trial: (u.trials?.length ?? 0) > 0, variant });
      } else {
        setUnit(null);
        setStep("confirm");
      }
    } catch {
      setCepStatus("error");
      setErrors((e) => ({ ...e, cep: M.cep }));
      lastCep.current = "";
    }
  }

  function onCepChange(v: string) {
    if (!started.current) {
      started.current = true;
      track("form_started", { variant });
    }
    const f = formatPostal(v, locale);
    setCep(f);
    setCepStatus("idle");
    const digits = f.replace(/\D/g, "");
    if (digits.length === cfg.postal.digits) resolve(digits);
  }

  function confirmCity() {
    setStep("details");
    track("city_confirmed", { uf: city?.uf, city: city?.city, variant });
  }

  function fixCity() {
    setStep("cep");
    setCity(null);
    setUnit(null);
    setUnitPick(false);
    setCep("");
    lastCep.current = "";
    onCity?.(null);
    setTimeout(() => cepRef.current?.focus(), 100);
  }

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (sending) return;
    const form = e.currentTarget;
    const payload = {
      ...fields,
      country: cfg.country,
      cep: cep.replace(/\D/g, ""),
      cpf: fields.cpf.replace(/\D/g, ""),
      birth_date: fields.birth_date,
      sex: fields.sex,
      privacy_consent: consent,
      // No Brasil o aceite é um só; nos EUA as mensagens de texto têm aceite próprio e opcional.
      marketing_consent: FORM.smsConsent ? sms : consent,
      website: (form.elements.namedItem("website") as HTMLInputElement | null)?.value ?? "",
      turnstile: turnstileToken,
      variant,
    };
    const errs = validateLead({ ...payload, phone: fields.phone }, locale);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setSending(true);
    setMsg(null);
    try {
      const r = await fetch("/api/lead", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const d = (await r.json()) as { ok: boolean; created?: boolean; redirect?: string; message?: string | null; errors?: FieldErrors; error?: string };
      if (!d.ok) {
        if (d.errors) setErrors(d.errors);
        setMsg({ kind: "err", text: d.error ?? M.generic });
        setSending(false);
        return;
      }
      if (city) onPlaced?.(city);
      setMsg({ kind: "ok", text: d.created ? fill(FORM.placedLine, { city: city?.city ?? FORM.cityFallback }) : FORM.existing });
      track(d.created ? "form_completed_client" : "form_existing_client", { uf: city?.uf, variant });
      // Cadastro novo na mesma aba: a página de obrigado mostra de novo a delay e as perguntas.
      try {
        sessionStorage.removeItem(WELCOME_SEEN);
      } catch {
        /* privado */
      }
      setTimeout(() => window.location.assign(d.redirect ?? cfg.routes.thanks), d.created ? 900 : 1400);
    } catch {
      setMsg({ kind: "err", text: M.generic });
      setSending(false);
    }
  }

  const set = (k: keyof typeof fields) => (v: string) =>
    setFields((f) => ({ ...f, [k]: k === "phone" ? formatPhoneFor(v, locale) : k === "cpf" ? formatCpf(v) : k === "birth_date" ? formatDateInput(v) : v }));

  const [consentBefore, consentAfter] = FORM.consent.split(FORM.consentLink);

  return (
    <form id={id} className="panel" onSubmit={submit} noValidate aria-live="polite">
      <h3 className="panel__title">{FORM.cepTitle}</h3>
      {cityHint && step === "cep" ? <p className="cep__help" style={{ marginTop: 10 }}>{cityHint}</p> : null}
      <div className="panel__step" ref={stepRef} key={step}>
        {step === "cep" ? (
          <div className="cep">
            <label className="cep__label" htmlFor={`${id}-cep`} data-step-item>
              {FORM.cepLabel}
            </label>
            <input
              ref={cepRef}
              id={`${id}-cep`}
              className="cep__input"
              inputMode="numeric"
              autoComplete="postal-code"
              placeholder={FORM.cepPlaceholder}
              value={cep}
              maxLength={cfg.postal.maxLength}
              onChange={(e) => onCepChange(e.target.value)}
              aria-invalid={!!errors.cep}
              aria-describedby={`${id}-cep-status`}
              data-step-item
            />
            <div id={`${id}-cep-status`} className={`cep__status${cepStatus === "error" ? " cep__error" : ""}`} data-step-item>
              {cepStatus === "loading" ? FORM.resolving : cepStatus === "error" ? errors.cep : ""}
            </div>
            <p className="cep__help" data-step-item>{FORM.cepHelp}</p>
          </div>
        ) : null}

        {step === "unit" && city && unit ? (
          <div className="confirm unit">
            <p className="confirm__q" data-step-item>{FORM.unit.eyebrow}</p>
            <p className="unit__title" data-step-item>{fill(FORM.unit.title, { city: city.city })}</p>
            {trials.length === 0 ? (
              <>
                <p className="unit__text" data-step-item>{FORM.unit.text}</p>
                <div className="confirm__actions" data-step-item>
                  <a className="btn btn--black btn-arrow" href={unit.url ?? SITE.studentUrl} target="_blank" rel="noopener" onClick={() => track("unit_click", { unit: unit.slug, variant })}>
                    {fill(FORM.unit.cta, { city: unit.label ?? unit.city })}
                  </a>
                  <button type="button" className="confirm__fix" onClick={fixCity}>{FORM.unit.fix}</button>
                </div>
              </>
            ) : unitPick ? (
              <>
                <p className="unit__text">{FORM.unit.pick}</p>
                <div className="confirm__actions">
                  {trials.map((t) => (
                    <a key={t.url} className="btn btn--green btn-arrow unit__trial" href={t.url} onClick={() => track("trial_click", { unit: unit.slug, trial: t.label ?? null, variant })}>
                      {(t.label ?? unit.city).toUpperCase()}
                    </a>
                  ))}
                  <button type="button" className="confirm__fix" onClick={fixCity}>{FORM.unit.fix}</button>
                </div>
              </>
            ) : (
              <>
                {/* Praça com aula experimental: aluno vai para o site; quem não é vai para a aula, na mesma aba. */}
                <p className="unit__question" data-step-item>{FORM.unit.question}</p>
                <p className="unit__text" data-step-item>{fill(FORM.unit.trialText, { city: unit.label ?? unit.city })}</p>
                <div className="confirm__actions" data-step-item>
                  <a className="btn btn--black btn-arrow" href={unit.url ?? SITE.studentUrl} target="_blank" rel="noopener" onClick={() => track("unit_click", { unit: unit.slug, student: true, variant })}>
                    {FORM.unit.yes}
                  </a>
                  {trials.length === 1 ? (
                    <a className="btn btn--green btn-arrow unit__trial" href={trials[0].url} onClick={() => track("trial_click", { unit: unit.slug, variant })}>
                      {FORM.unit.no}
                    </a>
                  ) : (
                    <button type="button" className="btn btn--green btn-arrow" onClick={() => { setUnitPick(true); track("trial_pick", { unit: unit.slug, variant }); }}>
                      {FORM.unit.no}
                    </button>
                  )}
                  <button type="button" className="confirm__fix" onClick={fixCity}>{FORM.unit.fix}</button>
                </div>
              </>
            )}
          </div>
        ) : null}

        {step === "confirm" && city ? (
          <div className="confirm">
            <p className="confirm__q" data-step-item>{FORM.confirmQuestion}</p>
            <div className="confirm__city" data-step-item>
              <span className="confirm__name">{city.city}</span>
              <span className="confirm__uf">{ufLabel(city.uf)}</span>
            </div>
            {city.approx ? <p className="confirm__approx" data-step-item>{FORM.approxNote}</p> : null}
            <div className="confirm__actions" data-step-item>
              <button type="button" className="btn btn--green btn-arrow" onClick={confirmCity}>
                {FORM.confirmYes}
              </button>
              <button type="button" className="confirm__fix" onClick={fixCity}>
                {FORM.confirmFix}
              </button>
            </div>
          </div>
        ) : null}

        {step === "details" && city ? (
          <div className="details">
            <div className="details__city" data-step-item>
              <span>
                <span className="muted">{FORM.yourCity} </span>
                <b>
                  {city.city} · {ufLabel(city.uf)}
                </b>
              </span>
              <button type="button" onClick={fixCity}>{FORM.confirmFix}</button>
            </div>
            <div className="fields">
              {textFields.map((f, i) => (
                <div className="field" key={f.k} data-step-item>
                  <label className="field__label" htmlFor={`${id}-${f.k}`}>{FORM.fields[f.k]}</label>
                  <input
                    ref={i === 0 ? firstRef : undefined}
                    id={`${id}-${f.k}`}
                    className="field__input"
                    type={f.type}
                    inputMode={f.mode}
                    autoComplete={f.ac}
                    placeholder={f.placeholder}
                    maxLength={f.max}
                    value={fields[f.k]}
                    onChange={(e) => set(f.k)(e.target.value)}
                    aria-invalid={!!errors[f.k]}
                    aria-describedby={errors[f.k] ? `${id}-${f.k}-err` : f.help ? `${id}-${f.k}-help` : undefined}
                    required
                  />
                  {f.help ? <span className="field__help" id={`${id}-${f.k}-help`}>{f.help}</span> : null}
                  <span className="field__error" id={`${id}-${f.k}-err`}>{errors[f.k] ?? ""}</span>
                </div>
              ))}
              <div className="field field--full" data-step-item role="radiogroup" aria-labelledby={`${id}-sex-label`}>
                <span className="field__label" id={`${id}-sex-label`}>{FORM.fields.sex}</span>
                <div className="seg">
                  {FORM.sexOptions.map((o) => (
                    <button
                      key={o.value}
                      type="button"
                      id={`${id}-sex-${o.value}`}
                      className="seg__opt"
                      role="radio"
                      aria-checked={fields.sex === o.value}
                      onClick={() => setFields((f) => ({ ...f, sex: o.value }))}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
                <span className="field__error">{errors.sex ?? ""}</span>
              </div>
            </div>
            <label className="consent" data-step-item>
              <input id={`${id}-consent`} type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} aria-invalid={!!errors.privacy_consent} />
              <span>
                {consentBefore}
                <Link href={cfg.routes.privacy} target="_blank">{FORM.consentLink}</Link>
                {consentAfter}
                {errors.privacy_consent ? <span className="field__error"> {errors.privacy_consent}</span> : null}
              </span>
            </label>
            {FORM.smsConsent ? (
              <label className="consent consent--sms" data-step-item>
                <input id={`${id}-sms`} type="checkbox" checked={sms} onChange={(e) => setSms(e.target.checked)} />
                <span>{FORM.smsConsent}</span>
              </label>
            ) : null}
            <input className="hp" type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
            {TURNSTILE ? <div ref={turnstileRef} data-step-item /> : null}
            <div data-step-item>
              <button type="submit" className="btn btn--green btn--block btn--lg" disabled={sending}>
                {sending ? FORM.sending : FORM.cta}
              </button>
              <p className="panel__micro">{msg ? <span className={msg.kind === "ok" ? "panel__msg" : "panel__err"}>{msg.text}</span> : FORM.micro}</p>
            </div>
          </div>
        ) : null}
      </div>
    </form>
  );
}
