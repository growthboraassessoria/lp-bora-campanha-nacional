"use client";
// Liga as ferramentas de medição em todas as páginas e registra a visualização de página.
// Google Tag, pixel da Meta e tracker da Audácia com os IDs da BORA (Alex, 27/10/2026); os IDs ficam em lib/analytics.ts.
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";
import { bootProviders, track, GA_ID, META_PIXEL_ID } from "@/lib/analytics";

export default function AnalyticsBoot() {
  const pathname = usePathname();
  const first = useRef(true);

  useEffect(() => {
    bootProviders();
    track("page_view");
  }, []);

  // Troca de página sem recarregar: a Meta só conta a primeira sozinha. O GA4 conta pelo histórico do navegador.
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const fbq = (window as unknown as { fbq?: (...a: unknown[]) => void }).fbq;
    if (typeof fbq === "function") fbq("track", "PageView");
  }, [pathname]);

  return (
    <>
      <Script src="/audacia-tracker.js" strategy="afterInteractive" />
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
      <Script id="google-tag" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)};gtag('js',new Date());gtag('set','linker',{domains:['boraassessoria.com']});gtag('config','${GA_ID}');`}</Script>
      <Script id="meta-pixel" strategy="afterInteractive">{`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${META_PIXEL_ID}');fbq('track','PageView');`}</Script>
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img height="1" width="1" style={{ display: "none" }} alt="" src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`} />
      </noscript>
    </>
  );
}
