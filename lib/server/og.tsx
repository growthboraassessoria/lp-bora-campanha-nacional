// A imagem de compartilhamento (1200×630) da campanha, no idioma do país.
import "server-only";
import { ImageResponse } from "next/og";
import { altoneFonts } from "./og-fonts";
import { getCopy } from "@/lib/copy";
import type { Locale } from "@/lib/locale";

export const OG_SIZE = { width: 1200, height: 630 };

export async function renderOg(locale: Locale) {
  const { META } = getCopy(locale);
  const last = META.ogLines.length - 1;
  return new ImageResponse(
    (
      <div style={{ width: 1200, height: 630, display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#fff", color: "#000", padding: 72, fontFamily: "Altone", fontWeight: 900 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 26, letterSpacing: 6 }}>
          <span>BORA</span>
          <span style={{ color: "#5c6e00" }}>{META.ogTag}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", fontSize: 150, lineHeight: 0.84, letterSpacing: -6 }}>
          {META.ogLines.map((l, i) => (
            <span key={l} style={i === last ? { background: "#ceff00", padding: "0 10px" } : {}}>{l}</span>
          ))}
        </div>
        <div style={{ fontSize: 28, letterSpacing: 2, color: "rgba(0,0,0,.6)" }}>{META.ogFoot}</div>
      </div>
    ),
    { ...OG_SIZE, fonts: (await altoneFonts()).filter((f) => f.weight === 900) },
  );
}
