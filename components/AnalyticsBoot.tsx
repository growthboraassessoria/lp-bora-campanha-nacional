"use client";
// Liga os provedores de analytics (quando configurados) e registra a visualização de página.
import { useEffect } from "react";
import Script from "next/script";
import { bootProviders, track } from "@/lib/analytics";

const GA = process.env.NEXT_PUBLIC_GA_ID;
const META = process.env.NEXT_PUBLIC_META_PIXEL_ID;

export default function AnalyticsBoot() {
  useEffect(() => {
    bootProviders();
    track("page_view");
  }, []);
  return (
    <>
      {GA ? (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA}`} strategy="afterInteractive" />
          <Script id="ga4" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)};gtag('js',new Date());gtag('config','${GA}',{send_page_view:false});`}</Script>
        </>
      ) : null}
      {META ? (
        <Script id="meta-pixel" strategy="afterInteractive">{`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${META}');fbq('track','PageView');`}</Script>
      ) : null}
    </>
  );
}
