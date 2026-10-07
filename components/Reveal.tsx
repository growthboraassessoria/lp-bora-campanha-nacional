"use client";
// Revela a subárvore ao montar (páginas internas, sem depender do scroll): manchetes por máscara e itens com leve subida.
import type { ReactNode } from "react";
import { useGsap } from "@/hooks/useGsap";
import { gsap } from "@/lib/gsap";

export default function Reveal({ children, className, as: Tag = "div" }: { children: ReactNode; className?: string; as?: "div" | "section" | "main" }) {
  const ref = useGsap<HTMLDivElement>(({ scope, reduced }) => {
    if (reduced) return;
    const lines = scope.querySelectorAll(".line__in");
    const items = scope.querySelectorAll("[data-reveal]");
    const tl = gsap.timeline({ defaults: { ease: "bora" } });
    if (lines.length) tl.from(lines, { yPercent: 112, duration: 1.1, stagger: 0.1 }, 0.2);
    if (items.length) tl.from(items, { y: 24, autoAlpha: 0, duration: 0.9, stagger: 0.08 }, 0.5);
  });
  const Comp = Tag as "div";
  return (
    <Comp ref={ref} className={className}>
      {children}
    </Comp>
  );
}
