import type { Metadata } from "next";
import SurveyScreen from "@/screens/SurveyScreen";
import { META } from "@/lib/copy";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: META.survey, robots: { index: false } };

export default function Perguntas() {
  return <SurveyScreen />;
}
