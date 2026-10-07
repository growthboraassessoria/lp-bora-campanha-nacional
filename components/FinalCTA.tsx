"use client";
// Fechamento: o ciclo volta para a pessoa. O mapa reage ao CEP mais uma vez.
import { useState } from "react";
import { FINAL } from "@/lib/copy";
import { useGsap } from "@/hooks/useGsap";
import { revealSection } from "@/lib/motion";
import BrazilMap, { type MapCity, type MapFocus } from "./BrazilMap";
import LeadForm, { type ResolvedCity } from "./LeadForm";
import Headline from "./Headline";

export default function FinalCTA({ cities }: { cities: MapCity[] }) {
  const [focus, setFocus] = useState<MapFocus>(null);
  const ref = useGsap<HTMLElement>(({ scope, reduced }) => revealSection(scope, reduced));
  return (
    <section ref={ref} className="final section theme-surface container" aria-labelledby="final-title">
      <div className="final__map" aria-hidden="true">
        <BrazilMap cities={cities} focus={focus} labels={4} patternOpacity={0.05} />
      </div>
      <div className="final__grid">
        <Headline id="final-title" lines={FINAL.title} size="l" green={[2]} />
        <div data-reveal>
          <LeadForm id="cadastro-final" variant="final" onCity={(c: ResolvedCity | null) => setFocus(c ? { uf: c.uf, lat: c.lat, lng: c.lng, label: c.city } : null)} />
        </div>
      </div>
    </section>
  );
}
