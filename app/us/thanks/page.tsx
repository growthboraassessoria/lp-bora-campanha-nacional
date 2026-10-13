import type { Metadata } from "next";
import ThanksScreen from "@/screens/ThanksScreen";
import { getCopy } from "@/lib/copy";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: getCopy("us").META.thanks, robots: { index: false } };

export default function UsThanks() {
  return <ThanksScreen locale="us" />;
}
