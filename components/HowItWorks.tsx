"use client";
// Três momentos em sequência de scroll, atravessados por uma pista que se desenha (DrawSVG + ScrollTrigger).
import { HOW } from "@/lib/copy";
import { useGsap } from "@/hooks/useGsap";
import { gsap, MOTION_OK } from "@/lib/gsap";
import { revealSection } from "@/lib/motion";
import Headline from "./Headline";

export default function HowItWorks() {
  const ref = useGsap<HTMLElement>(({ q, reduced, mm }) => {
    // Cabeçalho e fechamento revelam por conta própria; os passos têm o próprio gatilho (sem duas animações na mesma linha).
    q(".how__head, .how__close").forEach((el) => revealSection(el as HTMLElement, reduced));
    q(".step").forEach((el) => {
      const lines = (el as HTMLElement).querySelectorAll(".line__in");
      const items = (el as HTMLElement).querySelectorAll("[data-item]");
      if (reduced) return;
      gsap.from(lines, { yPercent: 112, duration: 1, stagger: 0.08, ease: "bora", scrollTrigger: { trigger: el, start: "top 80%", once: true } });
      gsap.from(items, { y: 20, autoAlpha: 0, duration: 0.8, stagger: 0.08, ease: "bora", delay: 0.2, scrollTrigger: { trigger: el, start: "top 80%", once: true } });
    });
    mm.add(MOTION_OK, () => {
      gsap.fromTo(q(".how__lane"), { drawSVG: "0%" }, { drawSVG: "100%", ease: "none", scrollTrigger: { trigger: q(".how__steps")[0], start: "top 60%", end: "bottom 60%", scrub: 0.8 } });
      q(".how__mark").forEach((m, i) => {
        gsap.fromTo(m, { scale: 0, transformOrigin: "center" }, { scale: 1, duration: 0.5, ease: "back.out(2)", scrollTrigger: { trigger: q(".step")[i], start: "top 65%", once: true } });
      });
    });
  });

  return (
    <section ref={ref} className="how section container" aria-labelledby="how-title">
      <div className="how__head">
        <Headline id="how-title" lines={HOW.title} size="m" className="how__title" />
      </div>
      <div className="how__wrap">
        <div className="how__track" aria-hidden="true">
          <svg viewBox="0 0 60 600" preserveAspectRatio="xMidYMin meet">
            <path d="M30 0 C30 90, 30 110, 30 180 S30 300, 30 380 S30 520, 30 600" fill="none" stroke="rgba(0,0,0,.14)" strokeWidth="10" strokeLinecap="round" />
            <path className="how__lane" d="M30 0 C30 90, 30 110, 30 180 S30 300, 30 380 S30 520, 30 600" fill="none" stroke="#ceff00" strokeWidth="10" strokeLinecap="round" />
            <path d="M30 0 C30 90, 30 110, 30 180 S30 300, 30 380 S30 520, 30 600" fill="none" stroke="rgba(0,0,0,.55)" strokeWidth="1.2" strokeDasharray="6 8" />
            {[40, 300, 560].map((y, i) => (
              <circle key={i} className="how__mark" cx="30" cy={y} r="9" fill="#000" stroke="#ceff00" strokeWidth="3" />
            ))}
          </svg>
        </div>
        <ol className="how__steps">
          {HOW.steps.map((s) => (
            <li className="step" key={s.n}>
              <span className="step__n" data-item>{s.n}</span>
              <h3 className="step__title">
                <span className="line"><span className="line__in">{s.title}</span></span>
              </h3>
              {s.text.map((t, i) => (
                <p className="step__text" key={i} data-item>{t}</p>
              ))}
            </li>
          ))}
        </ol>
      </div>
      <div className="how__close">
        <Headline lines={HOW.close} size="s" />
        <img className="how__flag" src="/brand/sticker-chegada-green.webp" alt="" width={720} height={308} loading="lazy" data-reveal />
      </div>
    </section>
  );
}
