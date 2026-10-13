// A página inicial da campanha, para o país pedido. /app/page.tsx (Brasil) e /app/us/page.tsx (EUA) só chamam esta tela.
import { cookies } from "next/headers";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import NationalCounter from "@/components/NationalCounter";
import HowItWorks from "@/components/HowItWorks";
import CityRanking from "@/components/CityRanking";
import NationalManifesto from "@/components/NationalManifesto";
import Founding50 from "@/components/Founding50";
import AboutBora from "@/components/AboutBora";
import Testimonials from "@/components/Testimonials";
import FAQ from "@/components/FAQ";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";
import MobileCTA from "@/components/MobileCTA";
import { getNationalStats, getRanking, getTestimonials } from "@/lib/db/cached";
import { EXPERIMENT_COOKIE, parseExperiment } from "@/lib/attribution";
import { LOCALES, type Locale } from "@/lib/locale";

export default async function HomeScreen({ locale }: { locale: Locale }) {
  const cfg = LOCALES[locale];
  // Depoimentos são de alunos do Brasil, em português: só entram na página brasileira.
  const [stats, ranking, testimonials, jar] = await Promise.all([getNationalStats(locale), getRanking(locale), locale === "br" ? getTestimonials() : Promise.resolve([]), cookies()]);
  const variant = parseExperiment(jar.get(EXPERIMENT_COOKIE)?.value).hero;
  const mapCities = ranking.map((r) => ({ slug: r.slug, name: r.name, uf: r.uf, lat: r.lat, lng: r.lng, leads: r.leads }));

  return (
    <>
      <Header locale={locale} />
      <main>
        <Hero variant={variant} cities={mapCities} />
        <NationalCounter stats={stats} />
        <HowItWorks />
        <CityRanking rows={ranking} limit={10} />
        <NationalManifesto cities={mapCities} />
        {cfg.features.founder ? <Founding50 leaderCity={ranking[0]?.name ?? null} /> : null}
        <AboutBora />
        <Testimonials items={testimonials} />
        <FAQ />
        <FinalCTA cities={mapCities} />
      </main>
      <Footer locale={locale} />
      <MobileCTA />
    </>
  );
}
