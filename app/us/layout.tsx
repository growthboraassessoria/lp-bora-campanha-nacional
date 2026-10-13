// A versão dos EUA da campanha: tudo o que está em /us é em inglês, com mapa dos EUA e busca por ZIP code.
import type { Metadata } from "next";
import { LocaleProvider } from "@/components/LocaleProvider";
import { getCopy } from "@/lib/copy";

const { META, SITE } = getCopy("us");

export const metadata: Metadata = {
  title: { default: META.title, template: META.template },
  description: SITE.description,
  openGraph: { title: META.ogTitle, description: SITE.description, type: "website", locale: "en_US", siteName: SITE.name },
  twitter: { card: "summary_large_image", title: META.ogTitle, description: SITE.description },
};

export default function UsLayout({ children }: { children: React.ReactNode }) {
  return <LocaleProvider locale="us">{children}</LocaleProvider>;
}
