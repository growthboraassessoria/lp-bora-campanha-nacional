import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import Headline from "@/components/Headline";
import { getStore } from "@/lib/db";
import { getCurrentLead } from "@/lib/server/session";
import { FOUNDER_PAGE, fill } from "@/lib/copy";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Aluno Fundador · Founding 50" };

export default async function FounderPage() {
  const lead = await getCurrentLead();
  const stat = lead ? await getStore().cityStat(lead.city_slug) : null;
  const city = lead?.city ?? "sua cidade";
  const checkout = process.env.NEXT_PUBLIC_CHECKOUT_URL;

  return (
    <>
      <Header />
      <main>
        <Reveal className="page">
          <p className="eyebrow" data-reveal>{FOUNDER_PAGE.eyebrow}</p>
          <Headline as="h1" lines={FOUNDER_PAGE.title.map((l) => fill(l, { city: city.toUpperCase() }))} size="l" green={[1]} />
          <p className="lede" data-reveal>{FOUNDER_PAGE.what}</p>
          {stat ? <p className="eyebrow" data-reveal>{fill(FOUNDER_PAGE.slots, { n: stat.founder_slots_left, city: lead!.city })}</p> : null}

          <h2 data-reveal>O que o Fundador ganha</h2>
          <ul className="founding__benefits" data-reveal style={{ maxWidth: 640 }}>
            {FOUNDER_PAGE.gains.map((g, i) => (
              <li key={g}><span>{String(i + 1).padStart(2, "0")}</span><span>{g}</span></li>
            ))}
          </ul>

          <h2 data-reveal>{FOUNDER_PAGE.conditionTitle}</h2>
          <div data-reveal>
            {FOUNDER_PAGE.condition.map((c) => (
              <p key={c} className="lede" style={{ color: "var(--fg)" }}>{c}</p>
            ))}
            <p style={{ marginTop: 12 }}>{FOUNDER_PAGE.conditionNote}</p>
          </div>

          <h2 data-reveal>O que inclui</h2>
          <ul data-reveal>
            {FOUNDER_PAGE.includes.map((i) => (
              <li key={i}>{i}</li>
            ))}
          </ul>

          <div data-reveal style={{ display: "flex", flexWrap: "wrap", gap: 14, alignItems: "center", marginTop: 12 }}>
            {checkout ? (
              <a className="btn btn--green btn--lg btn-arrow" href={checkout} target="_blank" rel="noopener">{FOUNDER_PAGE.cta}</a>
            ) : (
              <>
                <span className="btn btn--outline btn--lg" aria-disabled="true" style={{ opacity: 0.6, cursor: "default" }}>{FOUNDER_PAGE.cta}</span>
                <p className="muted" style={{ maxWidth: 40 + "ch" }}>{FOUNDER_PAGE.soon}</p>
              </>
            )}
            {!lead ? <Link className="btn btn--green btn--lg btn-arrow" href="/#cadastro">Quero a BORA na minha cidade</Link> : null}
          </div>
          <p data-reveal>{FOUNDER_PAGE.rules} <Link href="/termos" style={{ textDecoration: "underline" }}>Ver termos</Link>.</p>
        </Reveal>
      </main>
      <Footer />
    </>
  );
}
