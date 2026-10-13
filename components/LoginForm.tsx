"use client";
// Entrada na área do membro. Brasil: CPF e data de nascimento. EUA: celular e data de nascimento.
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { formatCpf, formatDateInput, formatPhoneUs, isValidCpf, isValidPhoneUs, messagesFor, parseBirthDateFor } from "@/lib/validation";
import { track } from "@/lib/analytics";
import { useConfig, useCopy } from "./LocaleProvider";

export default function LoginForm() {
  const { LOGIN, FORM } = useCopy();
  const cfg = useConfig();
  const us = cfg.locale === "us";
  const M = messagesFor(cfg.locale);
  const [id, setId] = useState("");
  const [birth, setBirth] = useState("");
  const [errors, setErrors] = useState<{ id?: string; birth?: string }>({});
  const [msg, setMsg] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (sending) return;
    const errs: { id?: string; birth?: string } = {};
    if (us ? !isValidPhoneUs(id) : !isValidCpf(id)) errs.id = us ? M.phone : M.cpf;
    if (!parseBirthDateFor(birth, cfg.locale)) errs.birth = M.birthDate;
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setSending(true);
    setMsg(null);
    try {
      const digits = id.replace(/\D/g, "");
      const body = us ? { country: "US", phone: digits, birth_date: birth } : { cpf: digits, birth_date: birth };
      const r = await fetch("/api/entrar", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const d = (await r.json()) as { ok: boolean; redirect?: string; error?: string };
      if (!d.ok) {
        setMsg(d.error ?? M.login);
        setSending(false);
        track("login_failed_client");
        return;
      }
      track("login_client");
      window.location.assign(d.redirect ?? cfg.routes.me);
    } catch {
      setMsg(M.generic);
      setSending(false);
    }
  }

  return (
    <form className="panel" onSubmit={submit} noValidate aria-live="polite">
      <div className="fields" style={{ marginTop: 4 }}>
        <div className="field">
          <label className="field__label" htmlFor="login-id">{LOGIN.id}</label>
          <input
            id="login-id"
            className="field__input"
            type={us ? "tel" : "text"}
            inputMode={us ? "tel" : "numeric"}
            autoComplete={us ? "tel-national" : "off"}
            placeholder={us ? FORM.placeholders.phone : FORM.placeholders.cpf}
            maxLength={14}
            value={id}
            onChange={(e) => setId(us ? formatPhoneUs(e.target.value) : formatCpf(e.target.value))}
            aria-invalid={!!errors.id}
            required
          />
          <span className="field__error">{errors.id ?? ""}</span>
        </div>
        <div className="field">
          <label className="field__label" htmlFor="login-birth">{LOGIN.birth}</label>
          <input id="login-birth" className="field__input" inputMode="numeric" autoComplete="bday" placeholder={FORM.placeholders.birth_date} maxLength={10} value={birth} onChange={(e) => setBirth(formatDateInput(e.target.value))} aria-invalid={!!errors.birth} required />
          <span className="field__error">{errors.birth ?? ""}</span>
        </div>
      </div>
      <div style={{ marginTop: 8 }}>
        <button type="submit" className="btn btn--green btn--block btn--lg" disabled={sending}>
          {sending ? LOGIN.sending : LOGIN.cta}
        </button>
        <p className="panel__micro">{msg ? <span className="panel__err">{msg}</span> : LOGIN.micro}</p>
      </div>
      <p className="login__foot">
        <span>{LOGIN.noAccount}</span>
        <Link href={cfg.routes.signup}>{LOGIN.signup}</Link>
      </p>
    </form>
  );
}
