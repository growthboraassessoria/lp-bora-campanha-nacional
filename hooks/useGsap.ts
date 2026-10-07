"use client";
// Cada seção monta suas animações dentro de um gsap.context com escopo no próprio elemento,
// e desmonta tudo ao sair. `reduced` chega resolvido para a seção decidir o que fazer sem movimento.
import { useEffect, useLayoutEffect, useRef, type DependencyList } from "react";
import { REDUCED, gsap } from "@/lib/gsap";

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export type GsapCtx<T extends HTMLElement> = {
  scope: T;
  q: gsap.utils.SelectorFunc;
  reduced: boolean;
  mm: gsap.MatchMedia;
};

export function useGsap<T extends HTMLElement = HTMLDivElement>(setup: (ctx: GsapCtx<T>) => void | (() => void), deps: DependencyList = []) {
  const ref = useRef<T>(null);
  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduced = window.matchMedia(REDUCED).matches;
    const mm = gsap.matchMedia();
    let cleanup: void | (() => void);
    const ctx = gsap.context(() => {
      cleanup = setup({ scope: el, q: gsap.utils.selector(el), reduced, mm });
    }, el);
    return () => {
      if (typeof cleanup === "function") cleanup();
      mm.revert();
      ctx.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return ref;
}

export function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia(REDUCED).matches;
}
