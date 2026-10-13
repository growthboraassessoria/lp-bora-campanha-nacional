import type { Metadata } from "next";
import MeScreen from "@/screens/MeScreen";
import { getCopy } from "@/lib/copy";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: getCopy("us").META.me, robots: { index: false } };

export default function UsMe() {
  return <MeScreen locale="us" />;
}
