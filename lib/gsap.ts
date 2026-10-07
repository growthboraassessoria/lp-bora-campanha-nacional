"use client";
// Registro único do GSAP e dos plugins (ScrollTrigger, DrawSVG e SplitText vêm no pacote desde a versão 3.13).
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { SplitText } from "gsap/SplitText";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin, SplitText);
  // Curva da marca: saída expo, sem bounce.
  gsap.registerEase("bora", (p: number) => 1 - Math.pow(1 - p, 5));
  gsap.defaults({ ease: "bora", duration: 0.9 });
}

export const REDUCED = "(prefers-reduced-motion: reduce)";
export const MOTION_OK = "(prefers-reduced-motion: no-preference)";
export const DESKTOP = "(min-width: 900px)";

export { gsap, ScrollTrigger, DrawSVGPlugin, SplitText };
