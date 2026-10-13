// O ranking completo das cidades de um país.
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CityRanking from "@/components/CityRanking";
import { getRanking } from "@/lib/db/cached";
import type { Locale } from "@/lib/locale";

export default async function RankingScreen({ locale }: { locale: Locale }) {
  const rows = await getRanking(locale);
  return (
    <>
      <Header locale={locale} />
      <main style={{ paddingTop: "var(--header-h)" }}>
        <CityRanking rows={rows} full showCta />
      </main>
      <Footer locale={locale} />
    </>
  );
}
