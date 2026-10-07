"use client";
// Só aparece com depoimentos reais e aprovados. Carrossel por arraste, sem autoplay.
import type { Testimonial } from "@/lib/db/types";
import { useGsap } from "@/hooks/useGsap";
import { revealSection } from "@/lib/motion";
import Headline from "./Headline";

export default function Testimonials({ items }: { items: Testimonial[] }) {
  const ref = useGsap<HTMLElement>(({ scope, reduced }) => revealSection(scope, reduced));
  if (!items.length) return null;
  return (
    <section ref={ref} className="testimonials section container" aria-labelledby="t-title">
      <Headline id="t-title" lines={["QUEM JÁ", "CORRE COM A BORA."]} size="m" />
      <div className="testimonials__track" role="list">
        {items.map((t) => (
          <figure className="tcard" key={t.id} role="listitem" data-reveal>
            {t.photo_url ? <img className="tcard__photo" src={t.photo_url} alt="" width={64} height={64} loading="lazy" /> : null}
            <blockquote className="tcard__text">“{t.text}”</blockquote>
            <figcaption className="tcard__who">
              {t.name} · {t.city}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
