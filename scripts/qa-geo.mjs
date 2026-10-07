// Testa a localização no mapa da hero com permissão concedida e uma posição simulada.
// Uso: node scripts/qa-geo.mjs [base] [pasta]
import puppeteer from "puppeteer-core";
import { mkdirSync } from "node:fs";
const base = process.argv[2] ?? "http://localhost:3000";
const out = process.argv[3] ?? "/tmp/lp-geo";
mkdirSync(out, { recursive: true });
const CHROME = process.env.CHROME ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ["--no-sandbox", "--hide-scrollbars"] });
const ctx = browser.defaultBrowserContext();
await ctx.overridePermissions(base, ["geolocation"]);
const points = [
  { name: "goiania", lat: -16.68, lng: -49.25, w: 1440, h: 900 },
  { name: "goiania-celular", lat: -16.68, lng: -49.25, w: 390, h: 844 },
  { name: "sao-paulo", lat: -23.55, lng: -46.63, w: 1440, h: 900 },
  { name: "brasilia", lat: -15.78, lng: -47.93, w: 1440, h: 900 },
  { name: "fora-do-brasil", lat: -34.6, lng: -58.4, w: 1440, h: 900 },
];
for (const p of points) {
  const page = await browser.newPage();
  await page.setViewport({ width: p.w, height: p.h, isMobile: p.w < 500, hasTouch: p.w < 500 });
  await page.setGeolocation({ latitude: p.lat, longitude: p.lng });
  await page.goto(base + "/?v=A", { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 5500));
  const info = await page.evaluate(() => ({ label: document.querySelector(".hero__locate")?.textContent?.trim(), cls: document.querySelector(".hero__locate")?.className, viewBox: document.querySelector(".hero__map svg")?.getAttribute("viewBox"), you: document.querySelector(".map-you text")?.textContent }));
  console.log(p.name, JSON.stringify(info));
  if (p.w < 500) await page.evaluate(() => document.querySelector(".hero__map")?.scrollIntoView({ block: "center" }));
  await new Promise((r) => setTimeout(r, 600));
  await page.screenshot({ path: `${out}/${p.name}.png` });
  await page.close();
}
await browser.close();
