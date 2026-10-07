"use client";
// Entrada na área do membro: CPF e data de nascimento.
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { LOGIN, FORM } from "@/lib/copy";
import { MESSAGES, formatCpf, formatDateInput, isValidCpf, parseBirthDate } from "@/lib/validation";
import { track } from "@/lib/analytics";

export default function LoginForm() {
  const [cpf, setCpf] = useState("");
  const [birth, setBirth] = useState("");
  const [errors, setErrors] = useState<{ cpf?: string; birth?: string }>({});
  const [msg, setMsg] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (sending) return;
    const errs: { cpf?: string; birth?: string } = {};
    if (!isValidCpf(cpf)) errs.cpf = MESSAGES.cpf;
    if (!parseBirthDate(birth)) errs.birth = MESSAGES.birthDate;
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setSending(true);
    setMsg(null);
    try {
      const r = await fetch("/api/entrar", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ cpf: cpf.replace(/\D/g, ""), birth_date: birth }) });
      const d = (await r.json()) as { ok: boolean; redirect?: string; error?: string };
      if (!d.ok) {
        setMsg(d.error ?? MESSAGES.login);
        setSending(false);
        track("login_failed_client");
        return;
      }
      track("login_client");
      window.location.assign(d.redirect ?? "/eu");
    } catch {
      setMsg(MESSAGES.generic);
      setSending(false);
    }
  }

  return (
    <form className="panel" onSubmit={submit} noValidate aria-live="polite">
      <div className="fields" style={{ marginTop: 4 }}>
        <div className="field">
          <label className="field__label" htmlFor="login-cpf">{LOGIN.cpf}</label>
          <input id="login-cpf" className="field__input" inputMode="numeric" autoComplete="off" placeholder={FORM.placeholders.cpf} maxLength={14} value={cpf} onChange={(e) => setCpf(formatCpf(e.target.value))} aria-invalid={!!errors.cpf} required />
          <span className="field__error">{errors.cpf ?? ""}</span>
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
        <p className="panel__micro">{msg ? <span className="panel__err">{msg}</span> : FORM.micro.replace("Leva 30 segundos. ", "")}</p>
      </div>
      <p className="login__foot">
        <span>{LOGIN.noAccount}</span>
        <Link href="/#cadastro">{LOGIN.signup}</Link>
      </p>
    </form>
  );
}
