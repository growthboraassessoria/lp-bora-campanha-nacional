import { ImageResponse } from "next/og";
import { promises as fs } from "node:fs";
import path from "node:path";

export const runtime = "nodejs";
export const alt = "BORA na sua cidade.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const buf = await fs.readFile(path.join(process.cwd(), "app/fonts/Altone-Heavy.ttf"));
  const heavy = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
  return new ImageResponse(
    (
      <div style={{ width: 1200, height: 630, display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#fff", color: "#000", padding: 72, fontFamily: "Altone" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 26, letterSpacing: 6 }}>
          <span>BORA</span>
          <span style={{ color: "#5c6e00" }}>VAMOS EM FRENTE</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", fontSize: 150, lineHeight: 0.84, letterSpacing: -6 }}>
          <span>BORA</span>
          <span>NA SUA</span>
          <span style={{ background: "#ceff00", padding: "0 10px" }}>CIDADE.</span>
        </div>
        <div style={{ fontSize: 28, letterSpacing: 2, color: "rgba(0,0,0,.6)" }}>Uma assessoria para todos.</div>
      </div>
    ),
    { ...size, fonts: [{ name: "Altone", data: heavy, weight: 900, style: "normal" }] },
  );
}
