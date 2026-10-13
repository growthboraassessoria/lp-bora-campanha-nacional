"use client";
// Perguntas em dois grupos: a campanha e treinar com a BORA. Numeração contínua.
import { useGsap } from "@/hooks/useGsap";
import { revealSection } from "@/lib/motion";
import { track } from "@/lib/analytics";
import Headline from "./Headline";
import { useCopy } from "./LocaleProvider";

export default function FAQ() {
  const { FAQ_GROUPS, FAQ_TITLE } = useCopy();
  const ref = useGsap<HTMLElement>(({ scope, reduced }) => revealSection(scope, reduced));
  let n = 0;
  return (
    <section ref={ref} className="faq section container" aria-labelledby="faq-title">
      <Headline id="faq-title" lines={FAQ_TITLE} size="m" />
      {FAQ_GROUPS.map((g) => (
        <div className="faq__group" key={g.eyebrow}>
          <div className="faq__head" data-reveal>
            <p className="eyebrow">{g.eyebrow}</p>
            {g.lede ? <p className="lede">{g.lede}</p> : null}
          </div>
          <div className="faq__list">
            {g.items.map((item) => {
              const i = ++n;
              return (
                <details className="faq__item" key={item.q} data-reveal onToggle={(e) => { if ((e.currentTarget as HTMLDetailsElement).open) track("faq_open", { n: i }); }}>
                  <summary className="faq__q">
                    <span className="faq__n">{String(i).padStart(2, "0")}</span>
                    <span>{item.q}</span>
                    <span className="faq__icon" aria-hidden="true" />
                  </summary>
                  <p className="faq__a">{item.a}</p>
                </details>
              );
            })}
          </div>
        </div>
      ))}
    </section>
  );
}
