"use client";
// Prova social viva: números editoriais gigantes, só com dados reais. Sem dados, a frase diz que o mapa começa com você.
import { formatNumber } from "@/lib/locale";
import { useGsap } from "@/hooks/useGsap";
import { countUp, revealSection } from "@/lib/motion";
import type { NationalStats } from "@/lib/db/types";
import Headline from "./Headline";
import { useCopy, useLocale } from "./LocaleProvider";

export default function NationalCounter({ stats }: { stats: NationalStats }) {
  const { PROOF } = useCopy();
  const locale = useLocale();
  const has = stats.leads > 0;
  const ref = useGsap<HTMLElement>(({ scope, reduced }) => {
    revealSection(scope, reduced);
    scope.querySelectorAll<HTMLElement>("[data-count]").forEach((el) => countUp(el, reduced, scope));
  }, [stats.leads, stats.cities, stats.states]);

  return (
    <section ref={ref} className="proof container" aria-label={PROOF.aria}>
      {has ? (
        <div className="proof__grid">
          {[
            [stats.leads, PROOF.people],
            [stats.cities, PROOF.cities],
            [stats.states, PROOF.states],
          ].map(([n, label]) => (
            <div key={label as string} data-reveal>
              <div className="proof__num" data-count={n}>
                {formatNumber(Number(n), locale)}
              </div>
              <div className="proof__label">{label}</div>
            </div>
          ))}
        </div>
      ) : null}
      <Headline lines={has ? PROOF.line : PROOF.empty} size="m" className="proof__line" green={[1]} />
    </section>
  );
}
