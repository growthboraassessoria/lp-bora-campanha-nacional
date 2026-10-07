"use client";
// O mapa proprietário da campanha. Contornos reais dos estados, pattern BORA como topografia,
// pontos por cidade cadastrada e um foco que aproxima a câmera: Brasil → estado → cidade.
// Tema claro por padrão (página branca); `theme="dark"` para fundos pretos.
import { useEffect, useId, useMemo, useRef } from "react";
import { BR_STATES, MAP_SIZE, project } from "@/lib/geo";
import { gsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/hooks/useGsap";

export type MapCity = { slug: string; name: string; uf: string; lat: number; lng: number; leads: number };
export type MapFocus = { uf?: string | null; lat?: number | null; lng?: number | null; label?: string | null } | null;

type Props = {
  cities: MapCity[];
  focus?: MapFocus;
  labels?: number;
  interactive?: boolean;
  className?: string;
  patternOpacity?: number;
  showUf?: boolean;
  reveal?: boolean;
  theme?: "light" | "dark";
};

const THEMES = {
  light: { fill: "#ffffff", stroke: "rgba(0,0,0,0.42)", fillActive: "rgba(206,255,0,0.45)", strokeActive: "#000", pattern: "/brand/pattern-bora-black.webp", label: "#000", uf: "rgba(0,0,0,0.38)", dotStroke: "#000", ring: "#000" },
  dark: { fill: "rgba(255,255,255,0.035)", stroke: "rgba(255,255,255,0.26)", fillActive: "rgba(206,255,0,0.12)", strokeActive: "#ceff00", pattern: "/brand/pattern-bora-white.webp", label: "#fff", uf: "rgba(255,255,255,0.35)", dotStroke: "#000", ring: "#ceff00" },
};

const bboxCache = new Map<string, [number, number, number, number]>();
function stateBox(uf: string): [number, number, number, number] | null {
  if (bboxCache.has(uf)) return bboxCache.get(uf)!;
  const st = BR_STATES.find((s) => s.uf === uf);
  if (!st) return null;
  const nums = st.d.match(/-?\d+(\.\d+)?/g)?.map(Number) ?? [];
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (let i = 0; i < nums.length; i += 2) {
    x0 = Math.min(x0, nums[i]); x1 = Math.max(x1, nums[i]); y0 = Math.min(y0, nums[i + 1]); y1 = Math.max(y1, nums[i + 1]);
  }
  const box: [number, number, number, number] = [x0, y0, x1, y1];
  bboxCache.set(uf, box);
  return box;
}

export default function BrazilMap({ cities, focus = null, labels = 6, interactive = false, className = "", patternOpacity = 0.06, showUf = false, reveal = false, theme = "light" }: Props) {
  const uid = useId().replace(/:/g, "");
  const svgRef = useRef<SVGSVGElement>(null);
  const groupRef = useRef<SVGGElement>(null);
  const T = THEMES[theme];

  const points = useMemo(() => {
    const max = Math.max(1, ...cities.map((c) => c.leads));
    return cities.map((c) => {
      const [x, y] = project(c.lng, c.lat);
      return { ...c, x, y, r: 1.6 + Math.sqrt(c.leads / max) * 4.2 };
    });
  }, [cities]);
  const labeled = useMemo(() => [...points].sort((a, b) => b.leads - a.leads).slice(0, labels), [points, labels]);
  const you = focus && typeof focus.lat === "number" && typeof focus.lng === "number" ? project(focus.lng!, focus.lat!) : null;

  // Câmera: Brasil inteiro, um estado ou uma cidade.
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    let vb = `0 0 ${MAP_SIZE} ${MAP_SIZE}`;
    if (you) {
      const w = 70;
      vb = `${you[0] - w / 2} ${you[1] - w / 2} ${w} ${w}`;
    } else if (focus?.uf) {
      const b = stateBox(focus.uf);
      if (b) {
        const pad = 18;
        const w = Math.max(b[2] - b[0], b[3] - b[1]) + pad * 2;
        vb = `${(b[0] + b[2]) / 2 - w / 2} ${(b[1] + b[3]) / 2 - w / 2} ${w} ${w}`;
      }
    }
    if (prefersReducedMotion()) {
      svg.setAttribute("viewBox", vb);
      return;
    }
    gsap.to(svg, { attr: { viewBox: vb }, duration: 1.6, ease: "power3.inOut", overwrite: "auto" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focus?.uf, you?.[0], you?.[1]]);

  // Parallax sutil ao mouse (só desktop, ponteiro fino e sem movimento reduzido).
  useEffect(() => {
    if (!interactive || prefersReducedMotion() || !groupRef.current) return;
    if (!window.matchMedia("(min-width: 900px) and (pointer: fine)").matches) return;
    const g = groupRef.current;
    const toX = gsap.quickTo(g, "x", { duration: 1.2, ease: "power3.out" });
    const toY = gsap.quickTo(g, "y", { duration: 1.2, ease: "power3.out" });
    const onMove = (e: PointerEvent) => {
      toX((e.clientX / window.innerWidth - 0.5) * -10);
      toY((e.clientY / window.innerHeight - 0.5) * -8);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [interactive]);

  // Entrada: estados surgem e pontos aparecem em sequência.
  useEffect(() => {
    if (!reveal || !svgRef.current || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.from(".map-state", { opacity: 0, duration: 1.2, stagger: { each: 0.02, from: "center" }, ease: "power2.out", delay: 0.9 });
      gsap.from(".map-dot", { scale: 0, transformOrigin: "center", duration: 0.6, stagger: 0.04, ease: "back.out(2)", delay: 1.7 });
      gsap.from(".map-label", { opacity: 0, y: 4, duration: 0.6, stagger: 0.08, delay: 2.2 });
    }, svgRef);
    return () => ctx.revert();
  }, [reveal]);

  return (
    <svg ref={svgRef} className={`map ${className}`.trim()} viewBox={`0 0 ${MAP_SIZE} ${MAP_SIZE}`} role="img" aria-label="Mapa do Brasil com as cidades que já pediram a BORA" style={{ width: "100%", height: "auto", overflow: "visible" }}>
      <defs>
        <clipPath id={`clip-${uid}`}>
          {BR_STATES.map((s) => (
            <path key={s.uf} d={s.d} />
          ))}
        </clipPath>
      </defs>
      <g ref={groupRef}>
        <image href={T.pattern} x="-30" y="-50" width="470" height="526" preserveAspectRatio="xMidYMid slice" opacity={patternOpacity} clipPath={`url(#clip-${uid})`} />
        {BR_STATES.map((s) => {
          const active = focus?.uf === s.uf;
          const dim = !!focus?.uf && !active;
          return (
            <path key={s.uf} className="map-state" d={s.d} fill={active ? T.fillActive : T.fill} stroke={active ? T.strokeActive : T.stroke} strokeWidth={active ? 1 : 0.65} vectorEffect="non-scaling-stroke" opacity={dim ? 0.5 : 1} style={{ transition: "fill .6s, stroke .6s, opacity .6s" }} />
          );
        })}
        {showUf
          ? BR_STATES.map((s) => (
              <text key={s.uf} x={s.cx} y={s.cy + 2} textAnchor="middle" fontSize="6" fontWeight="700" fill={T.uf} letterSpacing="0.5">
                {s.uf}
              </text>
            ))
          : null}
        {points.map((p, i) => (
          <circle key={p.slug} className="map-dot" cx={p.x} cy={p.y} r={p.r} fill="#ceff00" stroke={T.dotStroke} strokeWidth="0.5" style={{ animation: `map-pulse 3.2s ease-in-out ${(i % 7) * 0.4}s infinite`, transformBox: "fill-box", transformOrigin: "center" }} />
        ))}
        {labeled.map((p) => (
          <text key={`l-${p.slug}`} className="map-label" x={p.x + p.r + 2.5} y={p.y + 2} fontSize="6" fontWeight="700" fill={T.label} letterSpacing="0.6">
            {p.name.toUpperCase()}
          </text>
        ))}
        {you ? (
          <g className="map-you">
            <circle cx={you[0]} cy={you[1]} r="7" fill="none" stroke={T.ring} strokeWidth="0.8" opacity="0.7" style={{ animation: "map-ring 2s ease-out infinite", transformBox: "fill-box", transformOrigin: "center" }} />
            <circle cx={you[0]} cy={you[1]} r="2.6" fill="#ceff00" stroke="#000" strokeWidth="0.7" />
            {focus?.label ? (
              <text x={you[0]} y={you[1] - 6} textAnchor="middle" fontSize="4" fontWeight="900" fill={T.label} letterSpacing="0.5">
                {focus.label.toUpperCase()}
              </text>
            ) : null}
          </g>
        ) : null}
      </g>
      <style>{`@keyframes map-pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.35)}}@keyframes map-ring{0%{transform:scale(.4);opacity:.9}100%{transform:scale(2.2);opacity:0}}@media(prefers-reduced-motion:reduce){.map-dot,.map-you circle{animation:none!important}}`}</style>
    </svg>
  );
}
