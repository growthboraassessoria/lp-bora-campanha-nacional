import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CityRanking from "@/components/CityRanking";
import { getRanking } from "@/lib/db/cached";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Onde a BORA vai chegar primeiro?" };

export default async function RankingPage() {
  const rows = await getRanking();
  return (
    <>
      <Header />
      <main style={{ paddingTop: "var(--header-h)" }}>
        <CityRanking rows={rows} full showCta />
      </main>
      <Footer />
    </>
  );
}
