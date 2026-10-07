"use client";
// Revelações padrão das seções: manchetes por máscara e blocos com leve subida, disparados pelo scroll uma vez.
import { gsap } from "./gsap";

type Opts = { start?: string; stagger?: number; delay?: number };

export function revealSection(scope: HTMLElement, reduced: boolean, opts: Opts = {}) {
  const lines = scope.querySelectorAll<HTMLElement>(".line__in");
  const items = scope.querySelectorAll<HTMLElement>("[data-reveal]");
  if (reduced) return;
  const start = opts.start ?? "top 78%";
  if (lines.length) {
    gsap.from(lines, { yPercent: 112, duration: 1.1, stagger: opts.stagger ?? 0.08, ease: "bora", delay: opts.delay ?? 0, scrollTrigger: { trigger: scope, start, once: true } });
  }
  if (items.length) {
    gsap.from(items, { y: 28, autoAlpha: 0, duration: 0.9, stagger: 0.08, ease: "bora", delay: (opts.delay ?? 0) + 0.25, scrollTrigger: { trigger: scope, start, once: true } });
  }
}

/** Conta de zero até o valor do atributo data-count quando entra na tela. */
export function countUp(el: HTMLElement, reduced: boolean, trigger?: Element) {
  const target = Number(el.dataset.count ?? "0");
  const fmt = (n: number) => Math.round(n).toLocaleString("pt-BR");
  if (reduced || !target) {
    el.textContent = fmt(target);
    return;
  }
  const o = { v: 0 };
  el.textContent = "0";
  gsap.to(o, { v: target, duration: 1.8, ease: "power3.out", onUpdate: () => (el.textContent = fmt(o.v)), scrollTrigger: { trigger: trigger ?? el, start: "top 85%", once: true } });
}
