"use client";
// Escala 1, Brasil: manchete, mapa proprietário e o painel que coloca a cidade no mapa. Página branca, verde como sinal.
// Com permissão, o mapa mostra onde a pessoa está (estado e cidade conhecida mais perto); a posição não sai do aparelho.
import { useEffect, useRef, useState } from "react";
import { HERO, FORM, fill } from "@/lib/copy";
import { useGsap } from "@/hooks/useGsap";
import { gsap, MOTION_OK } from "@/lib/gsap";
import { track } from "@/lib/analytics";
import { UF_NAMES } from "@/lib/geo";
import { locate, type Located } from "@/lib/geo/locate";
import { UNITS } from "@/lib/geo/units";
import BrazilMap, { type MapCity, type MapFocus, type MapMarker } from "./BrazilMap";
import LeadForm, { type ResolvedCity } from "./LeadForm";

type Props = { variant: "A" | "B"; cities: MapCity[] };
type Geo = "idle" | "asking" | "found" | "outside" | "denied" | "unsupported";

export default function Hero({ variant, cities }: Props) {
  const [focus, setFocus] = useState<MapFocus>(null);
  const [placed, setPlaced] = useState<ResolvedCity | null>(null);
  const [geo, setGeo] = useState<Geo>("idle");
  const [where, setWhere] = useState<Located | null>(null);
  const [cityChosen, setCityChosen] = useState(false);
  const chosenRef = useRef(false);
  const lines = HERO.headline[variant];

  function findMe(auto: boolean) {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGeo("unsupported");
      return;
    }
    setGeo("asking");
    track("geo_prompt", { auto });
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const found = locate(pos.coords.latitude, pos.coords.longitude, cities);
        if (!found) {
          setGeo("outside");
          track("geo_outside");
          return;
        }
        setWhere(found);
        setGeo("found");
        track("geo_located", { uf: found.uf, near: found.near?.slug ?? null, auto });
      },
      (err) => {
        setGeo("denied");
        try {
          sessionStorage.setItem("bora_geo", "denied");
        } catch {}
        track("geo_denied", { code: err.code, auto });
      },
      { enableHighAccuracy: false, timeout: 12000, maximumAge: 600000 },
    );
  }

  // Ao entrar, pede a localização uma vez por sessão, depois da entrada da página.
  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return;
    try {
      if (sessionStorage.getItem("bora_geo") === "denied") return;
    } catch {}
    let cancelled = false;
    const t = setTimeout(async () => {
      if (cancelled) return;
      try {
        const p = await navigator.permissions?.query({ name: "geolocation" as PermissionName });
        if (p?.state === "denied") {
          setGeo("denied");
          return;
        }
      } catch {}
      findMe(true);
    }, 2200);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  // Só o CEP leva a câmera para o estado; a posição da pessoa fica como um ponto no Brasil inteiro.
  function onCity(c: ResolvedCity | null) {
    chosenRef.current = !!c;
    setCityChosen(!!c);
    setFocus(c ? { uf: c.uf, lat: c.lat, lng: c.lng, label: c.city } : null);
  }
  const marker: MapMarker = where && !cityChosen ? { lat: where.lat, lng: where.lng, label: HERO.geo.you } : null;

  const geoLabel =
    geo === "found" && where
      ? where.near
        ? fill(HERO.geo.foundNear, { city: where.near.name })
        : fill(HERO.geo.found, { uf: UF_NAMES[where.uf] ?? where.uf })
      : HERO.geo[geo];

  return (
    <section ref={ref} className="hero" aria-labelledby="hero-title">
      <div className="hero__content">
        <p className="eyebrow eyebrow--dot hero__eyebrow">{HERO.eyebrow}</p>
        <h1 id="hero-title" className={`display display-xl hero__title${variant === "B" ? " hero__title--b" : ""}`}>
          {lines.map((l, i) => (
            <span className="line" key={i}>
              <span className="line__in">{i === lines.length - 1 ? <span className="is-green">{l}</span> : l}</span>
            </span>
          ))}
        </h1>
        <p className="lede hero__sub">{HERO.sub}</p>
        <p className="body hero__text">{HERO.text}</p>
      </div>
      <div className="hero__map">
        <div aria-hidden="true">
          <BrazilMap cities={cities} focus={focus} marker={marker} units={UNITS} interactive reveal labels={6} patternOpacity={0} />
        </div>
        <ul className="hero__legend" aria-label="Legenda do mapa">
          <li><span className="hero__legend-unit" aria-hidden="true" />{HERO.legend.units}</li>
          <li><span className="hero__legend-dot" aria-hidden="true" />{HERO.legend.asking}</li>
        </ul>
        <button type="button" className={`hero__locate hero__locate--${geo}`} onClick={() => findMe(false)} disabled={geo === "asking"} aria-live="polite" title={HERO.geo.hint}>
          <span className="hero__locate-dot" aria-hidden="true" />
          <span>{geoLabel}</span>
        </button>
      </div>
      <div className="hero__panel">
        <LeadForm id="cadastro" variant="hero" onCity={onCity} onPlaced={setPlaced} />
        {placed ? <p className="hero__placed" role="status">{fill(FORM.placedLine, { city: placed.city })}</p> : null}
      </div>
    </section>
  );
}
