// Story dinâmico para o Instagram (1080×1920): "[CIDADE] ESTÁ EM #N · QUERO A BORA AQUI.", com o BORA ID e o QR do link.
import { ImageResponse } from "next/og";
import { getStore } from "@/lib/db";
import { isValidCode, shortLink, absoluteUrl } from "@/lib/referral";
import { altoneFonts } from "@/lib/server/og-fonts";
import { qrPath } from "@/lib/qr";
import { formatBoraId } from "@/lib/boraid";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const code = (new URL(req.url).searchParams.get("c") ?? "").toUpperCase();
  const store = getStore();
  const lead = isValidCode(code) ? await store.getLeadByCode(code) : null;
  if (!lead) return new Response("Não encontrado", { status: 404 });
  const stat = await store.cityStat(lead.city_slug);
  const rank = stat?.rank ?? null;
  const city = lead.city.toUpperCase();
  const link = shortLink(lead.referral_code);
  const qr = qrPath(absoluteUrl(`/r/${lead.referral_code}`));

  return new ImageResponse(
    (
      <div style={{ width: 1080, height: 1920, display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#000", color: "#fff", padding: 96, fontFamily: "Altone" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 34, fontWeight: 900, letterSpacing: 4 }}>
          <span>BORA</span>
          <span style={{ fontSize: 26, fontWeight: 500, letterSpacing: 6, color: "#ceff00" }}>VAMOS EM FRENTE</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontSize: 40, fontWeight: 500, letterSpacing: 6, color: "rgba(255,255,255,.7)" }}>{rank ? "ESTÁ EM" : "ENTROU NO MAPA"}</div>
          {rank ? <div style={{ fontSize: 320, fontWeight: 900, lineHeight: 0.85, color: "#ceff00", letterSpacing: -12 }}>{`#${rank}`}</div> : null}
          <div style={{ fontSize: city.length > 12 ? 96 : 128, fontWeight: 900, lineHeight: 0.9, letterSpacing: -4, marginTop: 24 }}>{city}</div>
          <div style={{ fontSize: 60, fontWeight: 900, lineHeight: 1, marginTop: 32 }}>QUERO A BORA AQUI.</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={{ fontSize: 24, fontWeight: 500, letterSpacing: 6, color: "rgba(255,255,255,.6)" }}>MEU BORA ID</span>
              <span style={{ fontSize: 88, fontWeight: 900, lineHeight: 1, letterSpacing: -3, color: "#ceff00" }}>{formatBoraId(lead.bora_number)}</span>
              <span style={{ fontSize: 28, fontWeight: 500, letterSpacing: 2, color: "#ceff00", marginTop: 18 }}>{link}</span>
            </div>
            <div style={{ display: "flex", background: "#fff", borderRadius: 22, padding: 14, width: 200, height: 200 }}>
              <svg width={172} height={172} viewBox={`0 0 ${qr.size} ${qr.size}`}>
                <path d={qr.path} fill="#000" />
              </svg>
            </div>
          </div>
          <div style={{ height: 6, width: "100%", background: "rgba(255,255,255,.15)", display: "flex" }}>
            <div style={{ height: 6, width: `${Math.min(100, stat?.pct ?? 0)}%`, background: "#ceff00" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 30, fontWeight: 500, letterSpacing: 2 }}>
            <span>{stat ? `${stat.leads} PESSOAS · META 500` : "META 500"}</span>
            <span style={{ color: "rgba(255,255,255,.6)" }}>APONTE A CÂMERA PARA ENTRAR</span>
          </div>
        </div>
      </div>
    ),
    { width: 1080, height: 1920, fonts: await altoneFonts(), headers: { "Cache-Control": "public, max-age=300" } },
  );
}
