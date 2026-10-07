import type { Metadata, Viewport } from "next";
import { altone } from "./fonts";
import { SITE } from "@/lib/copy";
import AnalyticsBoot from "@/components/AnalyticsBoot";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "BORA na sua cidade · BORA, Vamos em Frente", template: "%s · BORA, Vamos em Frente" },
  description: SITE.description,
  openGraph: { title: "BORA na sua cidade.", description: SITE.description, type: "website", locale: "pt_BR", siteName: SITE.name },
  twitter: { card: "summary_large_image", title: "BORA na sua cidade.", description: SITE.description },
  robots: { index: true, follow: true },
  appleWebApp: { capable: true, statusBarStyle: "default", title: "BORA" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = { themeColor: "#ffffff", width: "device-width", initialScale: 1, maximumScale: 1, userScalable: false, viewportFit: "cover" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={altone.variable}>
      <body>
        {children}
        <AnalyticsBoot />
      </body>
    </html>
  );
}
