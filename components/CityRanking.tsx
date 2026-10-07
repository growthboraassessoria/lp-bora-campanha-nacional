"use client";
// A corrida entre cidades: placar com pista, líder em destaque, filtro por estado e estado vazio elegante.
import { useMemo, useState } from "react";
import Link from "next/link";
import { RANKING } from "@/lib/copy";
import { UF_NAMES } from "@/lib/geo";
import { CITY_GOAL, type RankingRow } from "@/lib/db/types";
import { useGsap } from "@/hooks/useGsap";
import { gsap } from "@/lib/gsap";
import { revealSection } from "@/lib/motion";
import { track } from "@/lib/analytics";
import Headline from "./Headline";

type Props = { rows: RankingRow[]; limit?: number; full?: boolean; showCta?: boolean };

export default function CityRanking({ rows, limit = 10, full = false, showCta = true }: Props) {
  const [uf, setUf] = useState("");
  const ufs = useMemo(() => Array.from(new Set(rows.map((r) => r.uf))).sort(), [rows]);
  const visible = useMemo(() => {
    const f = uf ? rows.filter((r) => r.uf === uf) : rows;
    return full ? f : f.slice(0, limit);
  }, [rows, uf, limit, full]);

  const ref = useGsap<HTMLElement>(({ scope, q, reduced }) => {
    revealSection(scope, reduced);
    if (reduced) return;
    const items = q(".row");
    if (!items.length) return;
    gsap.from(items, { y: 24, autoAlpha: 0, duration: 0.8, stagger: 0.06, ease: "bora", scrollTrigger: { trigger: q(".board")[0], start: "top 80%", once: true } });
    q(".row__fill").forEach((bar) => {
      const pct = Number((bar as HTMLElement).dataset.pct ?? 0);
      gsap.fromTo(bar, { width: "0%" }, { width: `${pct}%`, duration: 1.4, ease: "power3.out", scrollTrigger: { trigger: bar, start: "top 90%", once: true } });
    });
  }, [visible.length, uf]);

  return (
    <section ref={ref} className="ranking section container" aria-labelledby="ranking-title">
      <div className="ranking__head">
        <div>
          <Headline id="ranking-title" lines={RANKING.title} size="m" />
          <p className="ranking__goal" style={{ marginTop: 18 }} data-reveal>{RANKING.goalLabel}</p>
        </div>
        {rows.length > 0 ? (
          <label className="ranking__filter" data-reveal>
            <span>{RANKING.filterLabel}</span>
            <select value={uf} onChange={(e) => { setUf(e.target.value); track("ranking_filter", { uf: e.target.value || "all" }); }} aria-label={RANKING.filterLabel}>
              <option value="">{RANKING.filterAll}</option>
              {ufs.map((u) => (
                <option key={u} value={u}>{UF_NAMES[u] ?? u}</option>
              ))}
            </select>
          </label>
        ) : null}
      </div>

      {rows.length === 0 ? (
        <div className="ranking__empty">
          <Headline lines={RANKING.emptyTitle} size="s" green={[1]} />
          <p className="body" data-reveal>{RANKING.emptyText}</p>
        </div>
      ) : (
        <ol className="board" aria-label="Ranking de cidades">
          {visible.map((r) => (
            <li key={r.slug} className={`row${r.rank === 1 ? " row--leader" : ""}`}>
              <span className="row__rank mono">{String(r.rank).padStart(2, "0")}</span>
              <Link href={`/cidade/${r.slug}`} className="row__city" title={`BORA ${r.name}`}>
                {r.name}
                <span className="row__uf">{r.uf}</span>
              </Link>
              <span className="row__people mono">
                {r.leads.toLocaleString("pt-BR")}<small>{RANKING.people}</small>
              </span>
              <span className="row__bar" aria-hidden="true"><span className="row__fill" data-pct={r.pct} /></span>
              <span className="row__pct mono" aria-label={`${r.pct}% da meta de ${CITY_GOAL}`}>{r.pct}%</span>
              <span className="row__founder">{r.founder_slots_left} {RANKING.founder}</span>
            </li>
          ))}
        </ol>
      )}

      {!full && rows.length > limit ? (
        <div className="ranking__foot" data-reveal>
          <Link href="/ranking" className="btn btn--outline btn-arrow" onClick={() => track("ranking_full_click")}>{RANKING.full}</Link>
        </div>
      ) : null}

      {showCta ? (
        <div className="ranking__cta">
          <div>
            <p className="eyebrow" data-reveal>{RANKING.ctaEyebrow}</p>
            <Headline lines={RANKING.ctaTitle} size="s" className="ranking__cta-title" />
          </div>
          <a href="#cadastro" className="btn btn--green btn--lg btn-arrow" data-reveal onClick={() => track("cta_click", { from: "ranking" })}>{RANKING.cta}</a>
        </div>
      ) : null}
    </section>
  );
}
