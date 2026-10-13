// Carteirinha BORA ID em PNG (1080×1350) para guardar e postar. Só quem tem o cookie assinado do cadastro gera a sua.
import { ImageResponse } from "next/og";
import { getCurrentLead } from "@/lib/server/session";
import { altoneFonts } from "@/lib/server/og-fonts";
import { absoluteUrl, shortLink } from "@/lib/attribution";
import { qrPath } from "@/lib/qr";
import { formatBoraId } from "@/lib/boraid";
import { getCopy, fill } from "@/lib/copy";
import { formatDate, localeOfLead, ufLabel } from "@/lib/locale";

export const runtime = "nodejs";

export async function GET() {
  const lead = await getCurrentLead();
  if (!lead) return new Response(getCopy("br").IMAGES.card.unauthorized, { status: 401 });
  const locale = localeOfLead(lead);
  const { IMAGES } = getCopy(locale);
  const link = absoluteUrl(`/r/${lead.referral_code}`);
  const qr = qrPath(link);
  const id = formatBoraId(lead.bora_number);
  const name = `${lead.first_name} ${lead.last_name}`.toUpperCase();

  return new ImageResponse(
    (
      <div style={{ width: 1080, height: 1350, display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#fff", color: "#000", padding: 80, fontFamily: "Altone" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 34, fontWeight: 900, letterSpacing: 4 }}>
          <span>BORA</span>
          <span style={{ fontSize: 24, fontWeight: 500, letterSpacing: 6, color: "#5c6e00" }}>{IMAGES.tag}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 36 }}>
          <div style={{ fontSize: 64, fontWeight: 900, lineHeight: 0.9, letterSpacing: -2 }}>{IMAGES.card.title}</div>
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: 920, height: 580, background: "#000", color: "#fff", borderRadius: 40, padding: 48, position: "relative" }}>
            <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 10, background: "#ceff00" }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 34, fontWeight: 900, letterSpacing: 4 }}>BORA</span>
              <span style={{ fontSize: 20, fontWeight: 500, letterSpacing: 6, color: "#ceff00" }}>BORA ID</span>
            </div>
            <div style={{ fontSize: 200, fontWeight: 900, lineHeight: 0.85, letterSpacing: -8, color: "#ceff00" }}>{id}</div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 600 }}>
                <span style={{ fontSize: 44, fontWeight: 900, letterSpacing: -1, lineHeight: 1 }}>{name}</span>
                <span style={{ fontSize: 22, fontWeight: 500, letterSpacing: 5, color: "rgba(255,255,255,.65)" }}>{`${lead.city.toUpperCase()} · ${ufLabel(lead.state)}`}</span>
                <span style={{ fontSize: 18, fontWeight: 500, letterSpacing: 4, color: "rgba(255,255,255,.5)", marginTop: 14 }}>{fill(IMAGES.card.since, { date: formatDate(lead.created_at, locale), code: lead.referral_code })}</span>
              </div>
              <div style={{ display: "flex", background: "#fff", borderRadius: 22, padding: 14, width: 190, height: 190 }}>
                <svg width={162} height={162} viewBox={`0 0 ${qr.size} ${qr.size}`}>
                  <path d={qr.path} fill="#000" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 28, fontWeight: 500, letterSpacing: 2 }}>
          <span style={{ color: "rgba(0,0,0,.6)" }}>{IMAGES.card.scan}</span>
          <span style={{ color: "#5c6e00" }}>{shortLink(lead.referral_code)}</span>
        </div>
      </div>
    ),
    {
      width: 1080,
      height: 1350,
      fonts: await altoneFonts(),
      headers: { "Cache-Control": "private, no-store", "Content-Disposition": `inline; filename="carteirinha-bora-${lead.referral_code.toLowerCase()}.png"` },
    },
  );
}
