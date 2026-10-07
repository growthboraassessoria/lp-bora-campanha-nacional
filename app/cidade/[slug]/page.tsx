import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import Headline from "@/components/Headline";
import TrackBar from "@/components/TrackBar";
import BrazilMap from "@/components/BrazilMap";
import LeadForm from "@/components/LeadForm";
import MembersList from "@/components/MembersList";
import { getStore, CITY_GOAL } from "@/lib/db";
import { getRanking } from "@/lib/db/cached";
import { UF_NAMES } from "@/lib/geo";
import { CITY_PAGE, fill } from "@/lib/copy";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const city = await getStore().getCity(slug);
  if (!city) return { title: "Cidade" };
  return { title: `BORA ${city.name}`, description: `Quantas pessoas já querem a BORA em ${city.name}, ${UF_NAMES[city.uf] ?? city.uf}. Coloque sua cidade no mapa.` };
}

export default async function CityPage({ params }: Params) {
  const { slug } = await params;
  const store = getStore();
  const [city, stat, group, ranking, members] = await Promise.all([store.getCity(slug), store.cityStat(slug), null, getRanking(), store.publicMembers(slug)]);
  if (!city) notFound();
  const leads = stat?.leads ?? 0;
  const pct = Math.min(100, Math.round((leads / CITY_GOAL) * 100));
  const stateRank = ranking.filter((r) => r.uf === city.uf).findIndex((r) => r.slug === slug) + 1;
  const cities = ranking.map((r) => ({ slug: r.slug, name: r.name, uf: r.uf, lat: r.lat, lng: r.lng, leads: r.leads }));
  const groupUrl = group ?? (await store.stateGroupUrl(city.uf));

  return (
    <>
      <Header />
      <main className="thanks">
        <div className="thanks__map" aria-hidden="true">
          <BrazilMap cities={cities} focus={{ uf: city.uf, lat: city.lat, lng: city.lng, label: city.name }} labels={0} patternOpacity={0.06} />
        </div>
        <Reveal className="container">
          <div className="thanks__hero">
            <p className="eyebrow" data-reveal>{CITY_PAGE.eyebrow}</p>
            <Headline lines={[fill(CITY_PAGE.title, { city: city.name })]} size="l" as="h1" />
            <p className="thanks__city" data-reveal>{leads > 0 ? fill(leads === 1 ? CITY_PAGE.one : CITY_PAGE.people, { city: city.name, n: leads.toLocaleString("pt-BR") }) : fill(CITY_PAGE.one, { city: city.name })}</p>
            <div className="thanks__stats" data-reveal>
              <div className="thanks__rank">
                <span className="thanks__label">{CITY_PAGE.rankNational}</span>
                <b>#{stat?.rank ?? "—"}</b>
              </div>
              <div>
                <span className="thanks__label">{CITY_PAGE.goal} · {fill(CITY_PAGE.done, { pct })}</span>
                <TrackBar value={leads} goal={CITY_GOAL} label={`Progresso de ${city.name}`} />
                <p className="muted" style={{ marginTop: 10, fontSize: 13 }}>
                  {stateRank ? `#${stateRank} ${fill(CITY_PAGE.rankState, { uf: UF_NAMES[city.uf] ?? city.uf })}` : null}
                  {groupUrl ? (
                    <>
                      {" · "}
                      <a href={groupUrl} target="_blank" rel="noopener" style={{ textDecoration: "underline" }}>Grupo BORA {city.uf}</a>
                    </>
                  ) : null}
                </p>
              </div>
            </div>
            <p className="lede" data-reveal>{fill(CITY_PAGE.next, { city: city.name })}</p>
            <p className="eyebrow" data-reveal>{fill(CITY_PAGE.founders, { n: stat?.founder_slots_left ?? 50 })}</p>
          </div>
          <MembersList members={members} city={city.name} />
          <div className="block" data-reveal style={{ paddingBottom: "clamp(64px, 10vw, 140px)", maxWidth: 760 }}>
            <LeadForm id="cadastro" variant="city" cityHint={`Você está em ${city.name}? Confirme com o seu CEP.`} />
          </div>
        </Reveal>
      </main>
      <Footer />
    </>
  );
}
