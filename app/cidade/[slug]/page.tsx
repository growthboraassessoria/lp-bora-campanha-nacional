import type { Metadata } from "next";
import CityScreen, { cityMetadata } from "@/screens/CityScreen";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  return cityMetadata("br", (await params).slug);
}

export default async function CityPage({ params }: Params) {
  return <CityScreen locale="br" slug={(await params).slug} />;
}
