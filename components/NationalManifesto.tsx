"use client";
// Momento nacional: o mapa gigante fixo e as frases passando sobre o território, controladas pelo scroll (desktop).
// No celular e com movimento reduzido, as frases ficam empilhadas, sem fixar a tela.
import { useState } from "react";
import { MANIFESTO } from "@/lib/copy";
import { useGsap } from "@/hooks/useGsap";
import { gsap, DESKTOP, MOTION_OK, REDUCED } from "@/lib/gsap";
import BrazilMap, { type MapCity } from "./BrazilMap";

export default function NationalManifesto({ cities }: { cities: MapCity[] }) {
  const [flow, setFlow] = useState(false);
  const ref = useGsap<HTMLElement>(({ scope, q, mm }) => {
    mm.add(`${DESKTOP} and ${MOTION_OK}`, () => {
      setFlow(false);
      const lines = q(".manifesto__line");
      const final = q(".manifesto__final");
      gsap.set([...lines, ...final], { autoAlpha: 0 });
      const tl = gsap.timeline({ scrollTrigger: { trigger: scope, start: "top top", end: `+=${(lines.length + 1) * 70}%`, pin: true, scrub: 0.7, anticipatePin: 1 } });
      tl.fromTo(q(".manifesto__map"), { scale: 0.82, autoAlpha: 0.5 }, { scale: 1, autoAlpha: 1, duration: 1.2, ease: "none" }, 0);
      lines.forEach((l, i) => {
        tl.fromTo(l, { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 1, ease: "power2.out" }, i * 1.9 + 0.6);
        tl.to(l, { autoAlpha: 0, y: -36, duration: 0.8, ease: "power2.in" }, i * 1.9 + 1.9);
      });
      tl.fromTo(final, { autoAlpha: 0, scale: 0.94 }, { autoAlpha: 1, scale: 1, duration: 1.2, ease: "power3.out" }, lines.length * 1.9 + 0.5);
      tl.to(q(".manifesto__map"), { scale: 1.08, duration: 2, ease: "none" }, lines.length * 1.9 + 0.5);
    });
    mm.add(`(max-width: 899px), ${REDUCED}`, () => {
      setFlow(true);
      if (window.matchMedia(REDUCED).matches) return;
      gsap.from(q(".manifesto__line, .manifesto__final"), { y: 24, autoAlpha: 0, duration: 0.9, stagger: 0.15, ease: "bora", scrollTrigger: { trigger: q(".manifesto__lines")[0], start: "top 75%", once: true } });
    });
  });

  return (
    <section ref={ref} className={`manifesto${flow ? " manifesto--flow" : ""}`} aria-label="O Brasil pede BORA">
      <div className="manifesto__stage">
        <div className="manifesto__map" aria-hidden="true">
          <BrazilMap cities={cities} labels={10} patternOpacity={0.08} showUf />
        </div>
        <div className="manifesto__lines">
          {MANIFESTO.lines.map((l) => (
            <p className="manifesto__line" key={l}>{l}</p>
          ))}
          <p className="manifesto__final"><span className="is-green">{MANIFESTO.final}</span></p>
        </div>
      </div>
    </section>
  );
}
