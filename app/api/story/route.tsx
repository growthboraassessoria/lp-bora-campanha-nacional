// Story dinâmico para o Instagram (1080×1920): "[CIDADE] ESTÁ EM #N · QUERO A BORA AQUI."
import { ImageResponse } from "next/og";
import { promises as fs } from "node:fs";
import path from "node:path";
import { getStore } from "@/lib/db";
import { isValidCode, shortLink } from "@/lib/referral";

export const runtime = "nodejs";

const toArrayBuffer = (b: Buffer) => b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength) as ArrayBuffer;
let heavy: ArrayBuffer | null = null;
let medium: ArrayBuffer | null = null;
async function fonts() {
  if (!heavy) heavy = toArrayBuffer(await fs.readFile(path.join(process.cwd(), "app/fonts/Altone-Heavy.ttf")));
  if (!medium) medium = toArrayBuffer(await fs.readFile(path.join(process.cwd(), "app/fonts/Altone-Medium.ttf")));
  return [
    { name: "Altone", data: heavy, weight: 900 as const, style: "normal" as const },
    { name: "Altone", data: medium, weight: 500 as const, style: "normal" as const },
  ];
}

export async function GET(req: Request) {
  const code = (new URL(req.url).searchParams.get("c") ?? "").toUpperCase();
  const store = getStore();
  const lead = isValidCode(code) ? await store.getLeadByCode(code) : null;
  if (!lead) return new Response("Não encontrado", { status: 404 });
  const stat = await store.cityStat(lead.city_slug);
  const rank = stat?.rank ?? null;
  const city = lead.city.toUpperCase();
  const link = shortLink(lead.referral_code);

  return new ImageResponse(
    (
      <div style={{ width: 1080, height: 1920, display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#000", color: "#fff", padding: 96, fontFamily: "Altone" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 34, fontWeight: 900, letterSpacing: 4 }}>
          <span>BORA</span>
          <span style={{ fontSize: 26, fontWeight: 500, letterSpacing: 6, color: "#ceff00" }}>VAMOS EM FRENTE</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontSize: 40, fontWeight: 500, letterSpacing: 6, color: "rgba(255,255,255,.7)" }}>{rank ? "ESTÁ EM" : "ENTROU NO MAPA"}</div>
          {rank ? <div style={{ fontSize: 360, fontWeight: 900, lineHeight: 0.85, color: "#ceff00", letterSpacing: -12 }}>{`#${rank}`}</div> : null}
          <div style={{ fontSize: city.length > 12 ? 104 : 140, fontWeight: 900, lineHeight: 0.9, letterSpacing: -4, marginTop: 24 }}>{city}</div>
          <div style={{ fontSize: 64, fontWeight: 900, lineHeight: 1, marginTop: 40 }}>QUERO A BORA AQUI.</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ height: 6, width: "100%", background: "rgba(255,255,255,.15)", display: "flex" }}>
            <div style={{ height: 6, width: `${Math.min(100, stat?.pct ?? 0)}%`, background: "#ceff00" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 30, fontWeight: 500, letterSpacing: 2 }}>
            <span>{stat ? `${stat.leads} PESSOAS · META 500` : "META 500"}</span>
            <span style={{ color: "#ceff00" }}>{link}</span>
          </div>
        </div>
      </div>
    ),
    { width: 1080, height: 1920, fonts: await fonts(), headers: { "Cache-Control": "public, max-age=300" } },
  );
}
