"use client";
// O que é a BORA: fotografia real da comunidade num bloco grande, tipografia e três pilares numerados. Página branca.
import Image from "next/image";
import { ABOUT } from "@/lib/copy";
import { useGsap } from "@/hooks/useGsap";
import { gsap, MOTION_OK } from "@/lib/gsap";
import { revealSection } from "@/lib/motion";
import Headline from "./Headline";

export default function AboutBora() {
  const ref = useGsap<HTMLElement>(({ scope, q, reduced, mm }) => {
    revealSection(scope, reduced);
    mm.add(MOTION_OK, () => {
      gsap.fromTo(q(".about__photo img"), { scale: 1.12, yPercent: -4 }, { scale: 1, yPercent: 4, ease: "none", scrollTrigger: { trigger: scope, start: "top bottom", end: "bottom top", scrub: 0.6 } });
    });
  });

  return (
    <section ref={ref} className="about section container" aria-labelledby="about-title">
      <div className="about__grid">
        <div className="about__photo" data-reveal>
          <Image src="/brand/bora-comunidade-1600.webp" alt="Comunidade BORA reunida depois de um treino" fill sizes="(min-width: 900px) 46vw, 100vw" />
        </div>
        <div>
          <Headline id="about-title" lines={ABOUT.title} size="m" className="about__title" />
          <Headline lines={ABOUT.title2} size="s" className="about__title" green={[0, 1, 2]} />
          <ol className="about__pillars">
            {ABOUT.pillars.map((p, i) => (
              <li className="pillar" key={p.title} data-reveal>
                <span className="pillar__n">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="pillar__title">{p.title}</h3>
                <p className="pillar__text">{p.text}</p>
              </li>
            ))}
          </ol>
          <div className="about__distances" data-reveal aria-label="Do 5K ao triathlon">
            <img src="/brand/icon-corrida-black.png" alt="" width={240} height={260} loading="lazy" />
            {ABOUT.distances.map((d) => (
              <span key={d}>{d}</span>
            ))}
            <img src="/brand/icon-bike-black.png" alt="" width={240} height={201} loading="lazy" />
            <img src="/brand/icon-nado-black.png" alt="" width={240} height={113} loading="lazy" />
          </div>
        </div>
      </div>
    </section>
  );
}
