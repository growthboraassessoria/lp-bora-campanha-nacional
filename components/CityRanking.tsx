"use client";
// A corrida entre cidades: placar com pista, líder em destaque, filtro por estado e estado vazio elegante.
import { useMemo, useState } from "react";
import Link from "next/link";
import { fill } from "@/lib/copy";
import { SOCIAL_SIGNALS } from "@/lib/geo/signals";
import { stateName } from "@/lib/geo";
import { formatNumber, ufLabel } from "@/lib/locale";
import { CITY_GOAL, type RankingRow } from "@/lib/db/types";
import { useGsap } from "@/hooks/useGsap";
import { gsap } from "@/lib/gsap";
import { revealSection } from "@/lib/motion";
import { track } from "@/lib/analytics";
import Headline from "./Headline";
import { useConfig, useCopy } from "./LocaleProvider";

type Props = { rows: RankingRow[]; limit?: number; full?: boolean; showCta?: boolean };

export default function CityRanking({ rows, limit = 10, full = false, showCta = true }: Props) {
  const { RANKING, SIGNALS } = useCopy();
  const cfg = useConfig();
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
                <option key={u} value={u}>{stateName(u)}</option>
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
        <ol className={`board${cfg.features.founder ? "" : " board--plain"}`} aria-label={RANKING.aria}>
          {visible.map((r) => (
            <li key={r.slug} className={`row${r.rank === 1 ? " row--leader" : ""}`}>
              <span className="row__rank mono">{String(r.rank).padStart(2, "0")}</span>
              <Link href={cfg.routes.city(r.slug)} className="row__city" title={`BORA ${r.name}`}>
                {r.name}
                <span className="row__uf">{ufLabel(r.uf)}</span>
              </Link>
              <span className="row__people mono">
                {formatNumber(r.leads, cfg.locale)}<small>{RANKING.people}</small>
              </span>
              <span className="row__bar" aria-hidden="true"><span className="row__fill" data-pct={r.pct} /></span>
              <span className="row__pct mono" aria-label={fill(RANKING.pctAria, { pct: r.pct, goal: CITY_GOAL })}>{r.pct}%</span>
              {cfg.features.founder ? <span className="row__founder">{r.founder_slots_left} {RANKING.founder}</span> : null}
            </li>
          ))}
        </ol>
      )}

      {!full && rows.length > limit ? (
        <div className="ranking__foot" data-reveal>
          <Link href={cfg.routes.ranking} className="btn btn--outline btn-arrow" onClick={() => track("ranking_full_click")}>{RANKING.full}</Link>
        </div>
      ) : null}

      {cfg.features.signals ? (
        <div className="signals" data-reveal>
          <p className="eyebrow">{SIGNALS.eyebrow}</p>
          <ul className="signals__list">
            {SOCIAL_SIGNALS.map((s) => (
              <li key={s.slug}>
                <span className="signals__ring" aria-hidden="true" />
                <b>{s.city}</b> <span className="muted">{s.uf}</span>
              </li>
            ))}
          </ul>
          <p className="body">{SIGNALS.text}</p>
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
