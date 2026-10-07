// Fontes Altone para imagens geradas no servidor (story, carteirinha, OG). Lidas uma vez por instância.
import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";

const toArrayBuffer = (b: Buffer) => b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength) as ArrayBuffer;
let heavy: ArrayBuffer | null = null;
let medium: ArrayBuffer | null = null;

export async function altoneFonts() {
  if (!heavy) heavy = toArrayBuffer(await fs.readFile(path.join(process.cwd(), "app/fonts/Altone-Heavy.ttf")));
  if (!medium) medium = toArrayBuffer(await fs.readFile(path.join(process.cwd(), "app/fonts/Altone-Medium.ttf")));
  return [
    { name: "Altone", data: heavy, weight: 900 as const, style: "normal" as const },
    { name: "Altone", data: medium, weight: 500 as const, style: "normal" as const },
  ];
}
