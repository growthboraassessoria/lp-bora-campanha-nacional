import type { Metadata } from "next";
import RankingScreen from "@/screens/RankingScreen";
import { META } from "@/lib/copy";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: META.ranking };

export default function RankingPage() {
  return <RankingScreen locale="br" />;
}
