"use client";
// Barra de ação fixa no celular (como um app): aparece quando nenhum formulário está na tela e leva ao cadastro.
import { useEffect, useState } from "react";
import { FORM } from "@/lib/copy";
import { track } from "@/lib/analytics";

export default function MobileCTA({ target = "#cadastro" }: { target?: string }) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const forms = Array.from(document.querySelectorAll<HTMLElement>("form.panel"));
    if (!forms.length) return;
    const visible = new Set<Element>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) e.isIntersecting ? visible.add(e.target) : visible.delete(e.target);
        setOn(visible.size === 0 && window.scrollY > window.innerHeight * 0.5);
      },
      { threshold: 0.15 },
    );
    forms.forEach((f) => io.observe(f));
    const onScroll = () => setOn(visible.size === 0 && window.scrollY > window.innerHeight * 0.5);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  function go() {
    track("cta_click", { from: "mobile_bar" });
    const el = document.querySelector<HTMLElement>(target);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
    setTimeout(() => el?.querySelector<HTMLInputElement>("input")?.focus({ preventScroll: true }), 600);
  }

  return (
    <div className={`mobile-cta${on ? " is-on" : ""}`} aria-hidden={!on}>
      <button type="button" className="btn btn--green btn-arrow" onClick={go} tabIndex={on ? 0 : -1}>
        {FORM.cta}
      </button>
    </div>
  );
}
