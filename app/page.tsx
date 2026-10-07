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

export const dynamic = "force-dynamic";

export default async function Home() {
  const [stats, ranking, testimonials, jar] = await Promise.all([getNationalStats(), getRanking(), getTestimonials(), cookies()]);
  const variant = parseExperiment(jar.get(EXPERIMENT_COOKIE)?.value).hero;
  const mapCities = ranking.map((r) => ({ slug: r.slug, name: r.name, uf: r.uf, lat: r.lat, lng: r.lng, leads: r.leads }));

  return (
    <>
      <Header />
      <main>
        <Hero variant={variant} cities={mapCities} />
        <NationalCounter stats={stats} />
        <HowItWorks />
        <CityRanking rows={ranking} limit={10} />
        <NationalManifesto cities={mapCities} />
        <Founding50 leaderCity={ranking[0]?.name ?? null} />
        <AboutBora />
        <Testimonials items={testimonials} />
        <FAQ />
        <FinalCTA cities={mapCities} />
      </main>
      <Footer />
      <MobileCTA />
    </>
  );
}
