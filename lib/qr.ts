// QR code como caminho SVG, gerado no servidor. Usado na carteirinha (página, PNG) e na story.
import QRCode from "qrcode";

export type Qr = { size: number; path: string };

/** Matriz do QR convertida em um único caminho SVG (1 unidade por módulo). */
export function qrPath(text: string, level: "L" | "M" | "Q" | "H" = "M"): Qr {
  const q = QRCode.create(text, { errorCorrectionLevel: level });
  const size = q.modules.size;
  const data = q.modules.data;
  let path = "";
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) if (data[y * size + x]) path += `M${x} ${y}h1v1h-1z`;
  }
  return { size, path };
}
