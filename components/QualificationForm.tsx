"use client";
// Perguntas da campanha, em duas telas. Cada resposta vira dado para a chegada na cidade.
import { useState } from "react";
import { track } from "@/lib/analytics";
import { useCopy } from "./LocaleProvider";

type Q = { key: string; label: string; options?: readonly string[]; type?: string };

export default function QualificationForm({ onDone, onStep }: { onDone?: () => void; onStep?: () => void }) {
  const { THANKS } = useCopy();
  const steps = THANKS.qualification.steps as unknown as readonly (readonly Q[])[];
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");

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
    onDone?.();
  }

  if (state === "done") return <p className="lede" role="status">{THANKS.qualification.done}</p>;

  const current = steps[step];
  const last = step === steps.length - 1;

  return (
    <div className="qual">
      <div>
        {current.map((q) => (
          <div className="qual__q" key={q.key}>
            <p className="qual__label" id={`q-${q.key}`}>{q.label}</p>
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
          <button type="button" className="btn btn--green" onClick={send} disabled={state === "sending" || Object.keys(answers).length === 0}>{THANKS.qualification.send}</button>
        ) : (
          <button type="button" className="btn btn--green btn-arrow" onClick={() => { setStep(step + 1); onStep?.(); }}>{THANKS.qualification.next}</button>
        )}
      </div>
    </div>
  );
}
