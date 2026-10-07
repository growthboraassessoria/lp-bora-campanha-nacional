import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import Headline from "@/components/Headline";
import TrackBar from "@/components/TrackBar";
import SharePanel from "@/components/SharePanel";
import BoraIdCard from "@/components/BoraIdCard";
import ProfileForm from "@/components/ProfileForm";
import { getStore, CITY_GOAL } from "@/lib/db";
import { getCurrentLead } from "@/lib/server/session";
import { absoluteUrl, shortLink } from "@/lib/attribution";
import { qrPath } from "@/lib/qr";
import { safeLead } from "@/lib/profile";
import { ME, fill } from "@/lib/copy";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Minha área", robots: { index: false } };

export default async function MinhaArea() {
  const lead = await getCurrentLead();
  if (!lead) redirect("/entrar");
  const store = getStore();
  const [stat, referral] = await Promise.all([store.cityStat(lead.city_slug), store.referralStats(lead.referral_code)]);
  const link = absoluteUrl(`/r/${lead.referral_code}`);
  const qr = qrPath(link);
  const leads = Math.max(1, stat?.leads ?? 1);

  return (
    <>
      <Header />
      <main className="me">
        <Reveal className="container">
          <div className="me__hero">
            <p className="eyebrow" data-reveal>{ME.eyebrow}</p>
            <Headline as="h1" lines={[fill(ME.hello, { name: lead.first_name.toUpperCase() })]} size="l" />
            <p className="me__sub" data-reveal>{fill(ME.sub, { city: lead.city })}</p>
            <div className="me__actions" data-reveal>
              <Link className="btn btn--outline btn-arrow" href="/">{ME.back}</Link>
              <form action="/api/sair" method="post">
                <button type="submit" className="confirm__fix" style={{ minHeight: 44 }}>{ME.logout}</button>
              </form>
            </div>
          </div>

          <section className="block" aria-labelledby="stats-title">
            <Headline id="stats-title" lines={ME.stats.title} size="s" className="block__title" green={[1]} />
            <div className="stats" data-reveal>
              <div className="stat"><span className="stat__n">{referral.clicks.toLocaleString("pt-BR")}</span><span className="stat__l">{ME.stats.clicks}</span></div>
              <div className="stat"><span className="stat__n">{referral.signups.toLocaleString("pt-BR")}</span><span className="stat__l">{ME.stats.signups}</span></div>
              <div className="stat"><span className="stat__n">{referral.network.toLocaleString("pt-BR")}</span><span className="stat__l">{ME.stats.network}</span></div>
              <div className="stat"><span className="stat__n">{stat?.rank ? `#${stat.rank}` : "—"}</span><span className="stat__l">{fill(ME.stats.rank, { city: lead.city })}</span></div>
              <div className="stat stat--wide">
                <span className="stat__l">{ME.stats.goal}</span>
                <TrackBar value={leads} goal={CITY_GOAL} label={`Progresso de ${lead.city}`} />
              </div>
            </div>
            {!referral.clicks && !referral.signups ? <p className="muted" data-reveal style={{ marginTop: 16 }}>{ME.stats.empty}</p> : null}
          </section>

          <div className="me__grid">
            <section className="block" aria-labelledby="share-title">
              <Headline id="share-title" lines={ME.share.title} size="s" className="block__title" />
              <p className="block__text" data-reveal>{fill(ME.share.text, { city: lead.city })}</p>
              <div data-reveal>
                <SharePanel code={lead.referral_code} city={lead.city} shortLink={shortLink(lead.referral_code)} fullLink={link} />
              </div>
              <Headline lines={ME.card.title} size="s" className="block__title" />
              <div data-reveal>
                <BoraIdCard number={lead.bora_number} name={`${lead.first_name} ${lead.last_name}`} city={lead.city} uf={lead.state} since={lead.created_at} code={lead.referral_code} qr={qr} link={link} />
              </div>
            </section>

            <section className="block" aria-labelledby="profile-title">
              <Headline id="profile-title" lines={ME.profile.title} size="s" className="block__title" green={[1]} />
              <p className="block__text" data-reveal>{fill(ME.profile.text, { city: lead.city })}</p>
              <div data-reveal>
                <ProfileForm lead={safeLead(lead)} />
              </div>
            </section>
          </div>
        </Reveal>
      </main>
      <Footer />
    </>
  );
}
