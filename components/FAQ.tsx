"use client";
import { FAQ as ITEMS } from "@/lib/copy";
import { useGsap } from "@/hooks/useGsap";
import { revealSection } from "@/lib/motion";
import { track } from "@/lib/analytics";
import Headline from "./Headline";

export default function FAQ() {
  const ref = useGsap<HTMLElement>(({ scope, reduced }) => revealSection(scope, reduced));
  return (
    <section ref={ref} className="faq section container" aria-labelledby="faq-title">
      <Headline id="faq-title" lines={["PERGUNTAS", "FREQUENTES."]} size="m" />
      <div className="faq__list">
        {ITEMS.map((item, i) => (
          <details className="faq__item" key={item.q} data-reveal onToggle={(e) => { if ((e.currentTarget as HTMLDetailsElement).open) track("faq_open", { n: i + 1 }); }}>
            <summary className="faq__q">
              <span className="faq__n">{String(i + 1).padStart(2, "0")}</span>
              <span>{item.q}</span>
              <span className="faq__icon" aria-hidden="true" />
            </summary>
            <p className="faq__a">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
