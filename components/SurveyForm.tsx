"use client";
// Formulário separado: CPF → acha o cadastro → perguntas. A sessão curta não abre a área do membro.
import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { formatCpf, isValidCpf, messagesFor } from "@/lib/validation";
import { fill } from "@/lib/copy";
import { track } from "@/lib/analytics";
import Headline from "./Headline";
import QualificationForm from "./QualificationForm";
import { useConfig, useCopy } from "./LocaleProvider";

type Phase = "cpf" | "questions" | "done";

export default function SurveyForm() {
  const { SURVEY, FORM } = useCopy();
  const cfg = useConfig();
  const M = messagesFor("br");
  const [phase, setPhase] = useState<Phase>("cpf");
  const [cpf, setCpf] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch("/api/perguntas")
      .then((r) => r.json())
      .then((d: { ok?: boolean; name?: string }) => {
        if (!alive || !d.ok || !d.name) return;
        setName(d.name);
        setPhase("questions");
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (sending) return;
    if (!isValidCpf(cpf)) {
      setError(M.cpf);
      return;
    }
    setSending(true);
    setError(null);
    setMsg(null);
    try {
      const r = await fetch("/api/perguntas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cpf: cpf.replace(/\D/g, "") }),
      });
      const d = (await r.json()) as { ok: boolean; name?: string; error?: string };
      if (!d.ok || !d.name) {
        setMsg(d.error ?? M.survey);
        setSending(false);
        track("qualification_lookup_failed_client");
        return;
      }
      track("qualification_lookup_client");
      setName(d.name);
      setPhase("questions");
    } catch {
      setMsg(M.generic);
      setSending(false);
    }
  }

  if (phase === "questions" || phase === "done") {
    return (
      <>
        <p className="eyebrow">{SURVEY.eyebrow}</p>
        <Headline as="h1" lines={[fill(SURVEY.found, { name })]} size="l" green={[0]} />
        {phase === "done" ? null : <p className="lede">{SURVEY.foundText}</p>}
        <QualificationForm onDone={() => setPhase("done")} />
        {phase === "done" ? (
          <p className="login__foot">
            <Link href={cfg.routes.me}>{SURVEY.profile}</Link>
          </p>
        ) : null}
      </>
    );
  }

  return (
    <>
      <p className="eyebrow">{SURVEY.eyebrow}</p>
      <Headline as="h1" lines={SURVEY.title} size="l" green={[1]} />
      <p className="lede">{SURVEY.text}</p>
      <form className="panel" onSubmit={submit} noValidate aria-live="polite">
        <div className="fields" style={{ marginTop: 4 }}>
          <div className="field">
            <label className="field__label" htmlFor="survey-cpf">{SURVEY.cpf}</label>
            <input
              id="survey-cpf"
              className="field__input"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              placeholder={FORM.placeholders.cpf}
              maxLength={14}
              value={cpf}
              onChange={(e) => { setCpf(formatCpf(e.target.value)); setError(null); }}
              aria-invalid={!!error}
              required
            />
            <span className="field__error">{error ?? ""}</span>
          </div>
        </div>
        <div style={{ marginTop: 8 }}>
          <button type="submit" className="btn btn--green btn--block btn--lg" disabled={sending}>
            {sending ? SURVEY.sending : SURVEY.cta}
          </button>
          <p className="panel__micro">{msg ? <span className="panel__err">{msg}</span> : null}</p>
        </div>
        <p className="login__foot">
          <span>{SURVEY.noAccount}</span>
          <Link href={cfg.routes.signup}>{SURVEY.signup}</Link>
        </p>
      </form>
    </>
  );
}
