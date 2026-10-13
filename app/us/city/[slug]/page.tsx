import type { Metadata } from "next";
import CityScreen, { cityMetadata } from "@/screens/CityScreen";
import { usSlugFromParam } from "@/lib/locale";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }> };

// A URL americana usa `tx-austin`; no banco o slug é `us-tx-austin`.
export async function generateMetadata({ params }: Params): Promise<Metadata> {
  return cityMetadata("us", usSlugFromParam((await params).slug));
}

export default async function UsCityPage({ params }: Params) {
  return <CityScreen locale="us" slug={usSlugFromParam((await params).slug)} />;
}
