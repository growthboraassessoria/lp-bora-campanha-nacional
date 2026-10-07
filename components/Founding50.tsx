"use client";
// Founding 50: mudança de atmosfera (verde), a credencial do Aluno Fundador e os objetos de marca como cultura.
import { FOUNDING } from "@/lib/copy";
import { useGsap } from "@/hooks/useGsap";
import { gsap, MOTION_OK } from "@/lib/gsap";
import { revealSection } from "@/lib/motion";
import { track } from "@/lib/analytics";
import Headline from "./Headline";

export default function Founding50({ leaderCity }: { leaderCity?: string | null }) {
  const ref = useGsap<HTMLElement>(({ scope, q, reduced, mm }) => {
    revealSection(scope, reduced);
    mm.add(MOTION_OK, () => {
      gsap.from(q(".credential"), { y: 60, rotate: -2, autoAlpha: 0, duration: 1.2, ease: "bora", scrollTrigger: { trigger: q(".credential")[0], start: "top 85%", once: true } });
      gsap.fromTo(q(".founding__jacket"), { y: 80, rotate: -8 }, { y: -40, rotate: 4, ease: "none", scrollTrigger: { trigger: scope, start: "top bottom", end: "bottom top", scrub: 0.8 } });
      gsap.fromTo(q(".founding__hand"), { y: 40, rotate: 10 }, { y: -20, rotate: -6, ease: "none", scrollTrigger: { trigger: scope, start: "top bottom", end: "bottom top", scrub: 0.8 } });
      gsap.fromTo(q(".credential__medal"), { y: -20, rotate: 8 }, { y: 20, rotate: -4, ease: "none", scrollTrigger: { trigger: scope, start: "top bottom", end: "bottom top", scrub: 1 } });
    });
  });

  const city = (leaderCity ?? "SUA CIDADE").toUpperCase();

  return (
    <section ref={ref} className="founding theme-green section container" aria-labelledby="founding-title">
      <div className="founding__grid">
        <div>
          <p className="eyebrow" data-reveal>{FOUNDING.eyebrow}</p>
          <Headline id="founding-title" lines={FOUNDING.title} size="m" className="founding__title" />
          <p className="founding__text" data-reveal>{FOUNDING.text}</p>
          <ul className="founding__benefits" data-reveal>
            {FOUNDING.benefits.map((b, i) => (
              <li key={b}>
                <span>{String(i + 1).padStart(2, "0")}</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="credential" aria-label="Exemplo de credencial de Aluno Fundador">
            <div className="credential__top">
              <img className="credential__brand" src="/brand/logo-white.png" alt="BORA" width={1200} height={307} loading="lazy" />
              <span className="credential__label">{FOUNDING.eyebrow}</span>
            </div>
            <div className="credential__num">#001</div>
            <div className="credential__city">{FOUNDING.credential.prefix} {city}</div>
            <div className="credential__sub">{FOUNDING.credential.label}</div>
            <img className="credential__medal" src="/brand/sticker-medalha-white.webp" alt="" width={720} height={875} loading="lazy" />
          </div>
          <div className="founding__objects" aria-hidden="true">
            <img className="founding__jacket" src="/brand/mockup-corta-vento.webp" alt="" width={1400} height={1400} loading="lazy" />
            <img className="founding__hand" src="/brand/sticker-hand-white.webp" alt="" width={720} height={801} loading="lazy" />
          </div>
        </div>
      </div>
      <Headline lines={FOUNDING.quote} size="l" className="founding__quote" />
      <div className="founding__cta">
        <a href="#cadastro" className="btn btn--black btn--lg btn-arrow" data-reveal onClick={() => track("founder_view", { from: "founding50" })}>{FOUNDING.cta}</a>
        <p className="founding__note" data-reveal>{FOUNDING.note}</p>
      </div>
    </section>
  );
}
