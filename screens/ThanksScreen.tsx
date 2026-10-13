// Depois do cadastro: a cidade no mapa, a carteirinha, o link pessoal e as perguntas opcionais.
import Link from "next/link";
import { redirect } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import Headline from "@/components/Headline";
import TrackBar from "@/components/TrackBar";
import SharePanel from "@/components/SharePanel";
import QualificationForm from "@/components/QualificationForm";
import BrazilMap from "@/components/BrazilMap";
import BoraIdCard from "@/components/BoraIdCard";
import { qrPath } from "@/lib/qr";
import { getStore, CITY_GOAL } from "@/lib/db";
import { getRanking } from "@/lib/db/cached";
import { getCurrentLead } from "@/lib/server/session";
import { absoluteUrl, shortLink } from "@/lib/attribution";
import { getCopy, fill } from "@/lib/copy";
import { LOCALES, formatNumber, localeOfLead, ufLabel, type Locale } from "@/lib/locale";

export default async function ThanksScreen({ locale }: { locale: Locale }) {
  const cfg = LOCALES[locale];
  const lead = await getCurrentLead();
  if (!lead) redirect(cfg.routes.home);
  // Cada pessoa vê a página do país onde se cadastrou.
  const own = localeOfLead(lead);
  if (own !== locale) redirect(LOCALES[own].routes.thanks);

  const { THANKS } = getCopy(locale);
  const store = getStore();
  const [stat, group, city, ranking] = await Promise.all([
    store.cityStat(lead.city_slug),
    cfg.features.group ? store.stateGroupUrl(lead.state) : Promise.resolve(null),
    store.getCity(lead.city_slug),
    getRanking(locale),
  ]);
  const leads = Math.max(1, stat?.leads ?? 1);
  const rank = stat?.rank ?? null;
  const slotsLeft = stat?.founder_slots_left ?? 50;
  const cities = ranking.map((r) => ({ slug: r.slug, name: r.name, uf: r.uf, lat: r.lat, lng: r.lng, leads: r.leads }));
  const focus = city ? { uf: city.uf, lat: city.lat, lng: city.lng, label: city.name } : { uf: lead.state };
  const link = absoluteUrl(`/r/${lead.referral_code}`);
  const qr = qrPath(link);

  return (
    <>
      <Header locale={locale} />
      <main className="thanks">
        <div className="thanks__map" aria-hidden="true">
          <BrazilMap cities={cities} focus={focus} labels={0} patternOpacity={0.06} />
        </div>
        <Reveal className="container">
          <div className="thanks__hero">
            <p className="eyebrow" data-reveal>{THANKS.eyebrow}</p>
            <Headline lines={[fill(THANKS.hello, { name: lead.first_name })]} size="m" as="h1" />
            <p className="thanks__city" data-reveal>{leads > 1 ? fill(THANKS.cityLine, { city: lead.city, n: formatNumber(leads, locale) }) : fill(THANKS.cityLineOne, { city: lead.city })}</p>
            <div className="thanks__stats" data-reveal>
              <div className="thanks__rank">
                <span className="thanks__label">{THANKS.rankLabel}</span>
                <b>#{rank ?? "—"}</b>
              </div>
              <div>
                <span className="thanks__label">{THANKS.goalLabel}</span>
                <TrackBar value={leads} goal={CITY_GOAL} label={fill(THANKS.progressAria, { city: lead.city })} />
              </div>
            </div>
          </div>

          <section className="block" aria-labelledby="card-title">
            <Headline id="card-title" lines={THANKS.card.title} size="s" className="block__title" green={[1]} />
            <p className="block__text" data-reveal>{THANKS.card.text}</p>
            <div data-reveal>
              <BoraIdCard number={lead.bora_number} name={`${lead.first_name} ${lead.last_name}`} city={lead.city} uf={ufLabel(lead.state)} since={lead.created_at} code={lead.referral_code} qr={qr} link={link} />
            </div>
            <p className="block__text" data-reveal>{THANKS.area.text}</p>
            <div data-reveal>
              <Link className="btn btn--outline btn-arrow" href={cfg.routes.me}>{THANKS.area.cta}</Link>
            </div>
          </section>

          {cfg.features.group ? (
            <section className="block" aria-labelledby="group-title">
              <Headline id="group-title" lines={THANKS.group.title.map((l) => fill(l, { uf: lead.state }))} size="s" className="block__title" green={[1]} />
              <p className="block__text" data-reveal>{group ? THANKS.group.text : THANKS.group.soon}</p>
              {group ? (
                <div data-reveal>
                  <a className="btn btn--green btn-arrow" href={group} target="_blank" rel="noopener">{THANKS.group.cta}</a>
                </div>
              ) : null}
            </section>
          ) : null}

          <section className="block" aria-labelledby="share-title">
            <Headline id="share-title" lines={THANKS.share.title} size="s" className="block__title" />
            <p className="block__text" data-reveal>{fill(THANKS.share.text, { city: lead.city })}</p>
            <div data-reveal>
              <SharePanel code={lead.referral_code} city={lead.city} shortLink={shortLink(lead.referral_code)} fullLink={link} />
            </div>
          </section>

          {cfg.features.founder && cfg.routes.founder ? (
            <section className="block" aria-labelledby="founder-title">
              <p className="eyebrow" data-reveal>{THANKS.founder.eyebrow}</p>
              <Headline id="founder-title" lines={[THANKS.founder.title]} size="s" className="block__title" />
              <p className="block__text" data-reveal>{slotsLeft > 0 ? fill(THANKS.founder.slots, { n: slotsLeft, city: lead.city }) : fill(THANKS.founder.none, { city: lead.city })}</p>
              <div data-reveal>
                <Link className="btn btn--outline btn-arrow" href={cfg.routes.founder}>{THANKS.founder.cta}</Link>
              </div>
            </section>
          ) : null}

          <section className="block" aria-label={THANKS.qualification.title.join(" ")}>
            <QualificationForm />
          </section>
        </Reveal>
      </main>
      <Footer locale={locale} />
    </>
  );
}
