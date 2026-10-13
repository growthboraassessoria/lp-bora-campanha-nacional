import type { Metadata } from "next";
import LoginScreen from "@/screens/LoginScreen";
import { META } from "@/lib/copy";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: META.login, robots: { index: false } };

export default function Entrar() {
  return <LoginScreen locale="br" />;
}
