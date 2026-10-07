"use client";
// Barra de progresso inspirada na pista: faixa, preenchimento verde e bandeira de chegada na meta.
import { useGsap } from "@/hooks/useGsap";
import { gsap } from "@/lib/gsap";

export default function TrackBar({ value, goal, label }: { value: number; goal: number; label?: string }) {
  const pct = Math.min(100, Math.round((value / goal) * 100));
  const ref = useGsap<HTMLDivElement>(({ q, reduced }) => {
    if (reduced) {
      gsap.set(q(".trackbar__fill"), { width: `${pct}%` });
      return;
    }
    gsap.fromTo(q(".trackbar__fill"), { width: "0%" }, { width: `${pct}%`, duration: 1.6, ease: "power3.out", delay: 0.4 });
  }, [pct]);
  return (
    <div ref={ref} className="trackbar" role="progressbar" aria-valuemin={0} aria-valuemax={goal} aria-valuenow={value} aria-label={label}>
      <div className="trackbar__nums mono">
        <span>{value.toLocaleString("pt-BR")}</span>
        <span className="muted">/ {goal}</span>
      </div>
      <div className="trackbar__lane">
        <div className="trackbar__fill" />
        <div className="trackbar__flag" aria-hidden="true" />
      </div>
    </div>
  );
}
