import type { Metadata } from "next";
import RankingScreen from "@/screens/RankingScreen";
import { getCopy } from "@/lib/copy";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: getCopy("us").META.ranking };

export default function UsRanking() {
  return <RankingScreen locale="us" />;
}
