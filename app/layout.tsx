import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { altone } from "./fonts";
import { SITE, META } from "@/lib/copy";
import { LOCALES } from "@/lib/locale";
import AnalyticsBoot from "@/components/AnalyticsBoot";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: META.title, template: META.template },
  description: SITE.description,
  openGraph: { title: META.ogTitle, description: SITE.description, type: "website", locale: "pt_BR", siteName: SITE.name },
  twitter: { card: "summary_large_image", title: META.ogTitle, description: SITE.description },
  robots: { index: true, follow: true },
  appleWebApp: { capable: true, statusBarStyle: "default", title: "BORA" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = { themeColor: "#ffffff", width: "device-width", initialScale: 1, maximumScale: 1, userScalable: false, viewportFit: "cover" };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // O proxy marca o país da página; o idioma do documento segue ele (pt-BR ou en-US).
  const locale = (await headers()).get("x-bora-locale") === "us" ? "us" : "br";
  return (
    <html lang={LOCALES[locale].lang} className={altone.variable} suppressHydrationWarning>
      <body>
        {children}
        <AnalyticsBoot />
      </body>
    </html>
  );
}
