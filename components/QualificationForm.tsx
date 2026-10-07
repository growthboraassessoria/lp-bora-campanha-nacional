"use client";
// Qualificação opcional, em duas telas. Nada bloqueia; cada resposta vira dado para a chegada na cidade.
import { useState } from "react";
import { THANKS } from "@/lib/copy";
import { track } from "@/lib/analytics";
import Headline from "./Headline";

type Q = { key: string; label: string; options?: readonly string[]; type?: string };

export default function QualificationForm() {
  const steps = THANKS.qualification.steps as unknown as readonly (readonly Q[])[];
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [state, setState] = useState<"idle" | "sending" | "done" | "skipped">("idle");

  function set(k: string, v: string) {
    setAnswers((a) => ({ ...a, [k]: v }));
    if (Object.keys(answers).length === 0) track("qualification_started");
  }

  async function send() {
    setState("sending");
    try {
      await fetch("/api/qualification", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(answers) });
    } catch {
      /* segue */
    }
    setState("done");
  }

  if (state === "done") return <p className="lede" role="status">{THANKS.qualification.done}</p>;
  if (state === "skipped") return null;

  const current = steps[step];
  const last = step === steps.length - 1;

  return (
    <div className="qual">
      <Headline lines={THANKS.qualification.title} size="s" />
      <p className="block__text" style={{ marginTop: 12 }}>{THANKS.qualification.text}</p>
      <div style={{ marginTop: 16 }}>
        {current.map((q) => (
          <div className="qual__q" key={q.key}>
            <label className="qual__label" htmlFor={`q-${q.key}`}>{q.label}</label>
            {q.options ? (
              <div className="chips" role="group" aria-labelledby={`q-${q.key}`}>
                {q.options.map((o) => (
                  <button type="button" key={o} className="chip" aria-pressed={answers[q.key] === o} onClick={() => set(q.key, o)}>{o}</button>
                ))}
              </div>
            ) : (
              <input id={`q-${q.key}`} className="qual__input" type="text" maxLength={80} value={answers[q.key] ?? ""} onChange={(e) => set(q.key, e.target.value)} />
            )}
          </div>
        ))}
      </div>
      <div className="qual__actions">
        {last ? (
          <button type="button" className="btn btn--green" onClick={send} disabled={state === "sending"}>{THANKS.qualification.send}</button>
        ) : (
          <button type="button" className="btn btn--green btn-arrow" onClick={() => setStep(step + 1)}>{THANKS.qualification.next}</button>
        )}
        <button type="button" className="qual__skip" onClick={() => setState("skipped")}>{THANKS.qualification.skip}</button>
      </div>
    </div>
  );
}
