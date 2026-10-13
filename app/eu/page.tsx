import type { Metadata } from "next";
import MeScreen from "@/screens/MeScreen";
import { META } from "@/lib/copy";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: META.me, robots: { index: false } };

export default function MinhaArea() {
  return <MeScreen locale="br" />;
}
