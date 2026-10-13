import type { Metadata } from "next";
import ThanksScreen from "@/screens/ThanksScreen";
import { META } from "@/lib/copy";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: META.thanks, robots: { index: false } };

export default function Obrigado() {
  return <ThanksScreen locale="br" />;
}
