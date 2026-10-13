import type { Metadata } from "next";
import LoginScreen from "@/screens/LoginScreen";
import { getCopy } from "@/lib/copy";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: getCopy("us").META.login, robots: { index: false } };

export default function UsLogin() {
  return <LoginScreen locale="us" />;
}
