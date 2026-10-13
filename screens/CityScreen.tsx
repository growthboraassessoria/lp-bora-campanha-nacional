// A página de uma cidade: quantas pessoas já pediram a BORA, a posição no ranking, quem ativou o perfil público e o cadastro.
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
import { stateName } from "@/lib/geo";
import { getCopy, fill } from "@/lib/copy";
import { LOCALES, formatNumber, localeOfSlug, ufLabel, type Locale } from "@/lib/locale";

/** `slug` é o slug completo do banco (`go-goiania`, `us-tx-austin`). */
export default async function CityScreen({ locale, slug }: { locale: Locale; slug: string }) {
  if (localeOfSlug(slug) !== locale) notFound();
  const cfg = LOCALES[locale];
  const { CITY_PAGE, THANKS } = getCopy(locale);
  const store = getStore();
  const [city, stat, ranking, members] = await Promise.all([store.getCity(slug), store.cityStat(slug), getRanking(locale), store.publicMembers(slug)]);
  if (!city) notFound();
  const leads = stat?.leads ?? 0;
  const pct = Math.min(100, Math.round((leads / CITY_GOAL) * 100));
  const stateRank = ranking.filter((r) => r.uf === city.uf).findIndex((r) => r.slug === slug) + 1;
  const cities = ranking.map((r) => ({ slug: r.slug, name: r.name, uf: r.uf, lat: r.lat, lng: r.lng, leads: r.leads }));
  const groupUrl = cfg.features.group ? await store.stateGroupUrl(city.uf) : null;

  return (
    <>
      <Header locale={locale} />
      <main className="thanks">
        <div className="thanks__map" aria-hidden="true">
          <BrazilMap cities={cities} focus={{ uf: city.uf, lat: city.lat, lng: city.lng, label: city.name }} labels={0} patternOpacity={0.06} />
        </div>
        <Reveal className="container">
          <div className="thanks__hero">
            <p className="eyebrow" data-reveal>{CITY_PAGE.eyebrow}</p>
            <Headline lines={[fill(CITY_PAGE.title, { city: city.name })]} size="l" as="h1" />
            <p className="thanks__city" data-reveal>{leads > 0 ? fill(leads === 1 ? CITY_PAGE.one : CITY_PAGE.people, { city: city.name, n: formatNumber(leads, locale) }) : fill(CITY_PAGE.one, { city: city.name })}</p>
            <div className="thanks__stats" data-reveal>
              <div className="thanks__rank">
                <span className="thanks__label">{CITY_PAGE.rankNational}</span>
                <b>#{stat?.rank ?? "—"}</b>
              </div>
              <div>
                <span className="thanks__label">{CITY_PAGE.goal} · {fill(CITY_PAGE.done, { pct })}</span>
                <TrackBar value={leads} goal={CITY_GOAL} label={fill(THANKS.progressAria, { city: city.name })} />
                <p className="muted" style={{ marginTop: 10, fontSize: 13 }}>
                  {stateRank ? fill(CITY_PAGE.rankIn, { n: stateRank, where: fill(CITY_PAGE.rankState, { uf: stateName(city.uf) }) }) : null}
                  {groupUrl ? (
                    <>
                      {" · "}
                      <a href={groupUrl} target="_blank" rel="noopener" style={{ textDecoration: "underline" }}>{fill(CITY_PAGE.group, { uf: ufLabel(city.uf) })}</a>
                    </>
                  ) : null}
                </p>
              </div>
            </div>
            <p className="lede" data-reveal>{fill(CITY_PAGE.next, { city: city.name })}</p>
            {cfg.features.founder ? <p className="eyebrow" data-reveal>{fill(CITY_PAGE.founders, { n: stat?.founder_slots_left ?? 50 })}</p> : null}
          </div>
          <MembersList members={members} city={city.name} locale={locale} />
          <div className="block" data-reveal style={{ paddingBottom: "clamp(64px, 10vw, 140px)", maxWidth: 760 }}>
            <LeadForm id="cadastro" variant="city" cityHint={fill(CITY_PAGE.hint, { city: city.name })} />
          </div>
        </Reveal>
      </main>
      <Footer locale={locale} />
    </>
  );
}

export async function cityMetadata(locale: Locale, slug: string) {
  const { META } = getCopy(locale);
  const city = localeOfSlug(slug) === locale ? await getStore().getCity(slug) : null;
  if (!city) return { title: META.cityFallback };
  return { title: fill(META.cityTitle, { city: city.name }), description: fill(META.cityDesc, { city: city.name, uf: stateName(city.uf) }) };
}
