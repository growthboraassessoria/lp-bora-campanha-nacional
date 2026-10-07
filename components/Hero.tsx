"use client";
// Escala 1, Brasil: manchete, mapa proprietário e o painel que coloca a cidade no mapa. Página branca, verde como sinal.
import { useState } from "react";
import { HERO, FORM, fill } from "@/lib/copy";
import { useGsap } from "@/hooks/useGsap";
import { gsap, MOTION_OK } from "@/lib/gsap";
import BrazilMap, { type MapCity, type MapFocus } from "./BrazilMap";
import LeadForm, { type ResolvedCity } from "./LeadForm";

type Props = { variant: "A" | "B"; cities: MapCity[] };

export default function Hero({ variant, cities }: Props) {
  const [focus, setFocus] = useState<MapFocus>(null);
  const [placed, setPlaced] = useState<ResolvedCity | null>(null);
  const lines = HERO.headline[variant];

  const ref = useGsap<HTMLElement>(({ q, reduced, mm, scope }) => {
    if (reduced) return;
    const tl = gsap.timeline({ defaults: { ease: "bora" } });
    tl.from(q(".hero__eyebrow"), { y: 12, autoAlpha: 0, duration: 0.7 }, 0.35)
      .from(q(".hero__title .line__in"), { yPercent: 112, duration: 1.2, stagger: 0.2 }, 0.5)
      .from(q(".hero__sub, .hero__text"), { y: 18, autoAlpha: 0, duration: 0.8, stagger: 0.12 }, 1.4)
      .from(q(".hero__map"), { autoAlpha: 0, scale: 0.96, transformOrigin: "50% 50%", duration: 1.2 }, 0.9)
      .from(q(".hero__panel"), { y: 28, autoAlpha: 0, duration: 0.9 }, 2.0);
    mm.add(`${MOTION_OK} and (min-width: 900px)`, () => {
      gsap.to(q(".hero__title"), { yPercent: -10, autoAlpha: 0.4, ease: "none", scrollTrigger: { trigger: scope, start: "top top", end: "bottom 40%", scrub: 0.6 } });
    });
  }, [variant]);

  return (
    <section ref={ref} className="hero" aria-labelledby="hero-title">
      <div className="hero__content">
        <p className="eyebrow eyebrow--dot hero__eyebrow">{HERO.eyebrow}</p>
        <h1 id="hero-title" className={`display ${variant === "B" ? "display-l" : "display-xl"} hero__title`}>
          {lines.map((l, i) => (
            <span className="line" key={i}>
              <span className={`line__in${i === lines.length - 1 ? " is-green" : ""}`}>{l}</span>
            </span>
          ))}
        </h1>
        <p className="lede hero__sub">{HERO.sub}</p>
        <p className="body hero__text">{HERO.text}</p>
      </div>
      <div className="hero__map" aria-hidden="true">
        <BrazilMap cities={cities} focus={focus} interactive reveal labels={6} patternOpacity={0} />
      </div>
      <div className="hero__panel">
        <LeadForm id="cadastro" variant="hero" onCity={(c) => setFocus(c ? { uf: c.uf, lat: c.lat, lng: c.lng, label: c.city } : null)} onPlaced={setPlaced} />
        {placed ? <p className="hero__placed" role="status">{fill(FORM.placedLine, { city: placed.city })}</p> : null}
      </div>
    </section>
  );
}
