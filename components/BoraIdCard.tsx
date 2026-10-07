"use client";
// A carteirinha digital: BORA ID, nome, cidade e o QR do link pessoal. No desktop, inclina com o ponteiro.
import { useEffect, useRef } from "react";
import { THANKS } from "@/lib/copy";
import { formatBoraId, formatDateBr } from "@/lib/boraid";
import { track } from "@/lib/analytics";
import { gsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/hooks/useGsap";

type Props = { number: number; name: string; city: string; uf: string; since: string; code: string; qr: { size: number; path: string }; link: string };

export default function BoraIdCard({ number, name, city, uf, since, code, qr, link }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    gsap.from(el, { y: 28, rotationX: -10, autoAlpha: 0, duration: 1, ease: "bora", transformPerspective: 1200, clearProps: "opacity,visibility" });
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const rx = gsap.quickTo(el, "rotationX", { duration: 0.6, ease: "power3.out" });
    const ry = gsap.quickTo(el, "rotationY", { duration: 0.6, ease: "power3.out" });
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      ry(px * 14);
      rx(-py * 14);
      el.style.setProperty("--mx", `${(px + 0.5) * 100}%`);
    };
    const onLeave = () => {
      rx(0);
      ry(0);
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  const id = formatBoraId(number);
  return (
    <div className="boraid">
      <div ref={ref} className="boraid__card" aria-label={`Carteirinha BORA ${id}`}>
        <div className="boraid__holo" aria-hidden="true" />
        <div className="boraid__top">
          <img src="/brand/logo-white.png" alt="BORA" width={1200} height={307} className="boraid__logo" />
          <span className="boraid__label">{THANKS.card.label}</span>
        </div>
        <div className="boraid__num">{id}</div>
        <div className="boraid__who">
          <span className="boraid__name">{name}</span>
          <span className="boraid__city">
            {city} · {uf}
          </span>
        </div>
        <div className="boraid__foot">
          <div className="boraid__meta">
            <span className="boraid__k">{THANKS.card.since}</span>
            <span className="boraid__v">{formatDateBr(since)}</span>
            <span className="boraid__k boraid__k--gap">{THANKS.card.campaign}</span>
            <span className="boraid__v">{code}</span>
          </div>
          <div className="boraid__qr" role="img" aria-label={`QR code do link ${link}`}>
            <svg viewBox={`0 0 ${qr.size} ${qr.size}`} shapeRendering="crispEdges">
              <path d={qr.path} fill="#000" />
            </svg>
          </div>
        </div>
      </div>
      <div className="boraid__actions">
        <a className="btn btn--black btn-arrow" href="/api/carteirinha" target="_blank" rel="noopener" onClick={() => track("card_download", { code })}>
          {THANKS.card.save}
        </a>
        <p className="muted boraid__hint">{THANKS.card.saveHint}</p>
      </div>
    </div>
  );
}
