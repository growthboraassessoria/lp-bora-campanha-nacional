// QA visual: abre as rotas no Chrome, rola a página devagar (para disparar as animações de scroll) e salva capturas.
// Uso: node scripts/qa-shots.mjs <pastaDeSaida> [url=http://localhost:3000]
import puppeteer from "puppeteer-core";
import { mkdirSync } from "node:fs";

const out = process.argv[2] ?? "/tmp/lp-shots";
const base = process.argv[3] ?? "http://localhost:3000";
mkdirSync(out, { recursive: true });
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const routes = (process.env.ROUTES ?? "/").split(",");
const sizes = (process.env.SIZES ?? "1440x900,390x844").split(",").map((s) => s.split("x").map(Number));

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ["--no-sandbox", "--hide-scrollbars"] });
for (const route of routes) {
  for (const [w, h] of sizes) {
    const page = await browser.newPage();
    const errors = [];
    page.on("console", (m) => { if (m.type() === "error") errors.push(m.text().slice(0, 200)); });
    page.on("pageerror", (e) => errors.push("pageerror: " + String(e).slice(0, 200)));
    await page.setViewport({ width: w, height: h, deviceScaleFactor: 1, isMobile: w < 600, hasTouch: w < 600 });
    await page.goto(base + route, { waitUntil: "networkidle0", timeout: 60000 });
    await new Promise((r) => setTimeout(r, 3500));
    const name = (route === "/" ? "home" : route.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "")) + `-${w}`;
    await page.screenshot({ path: `${out}/${name}-top.png` });
    // rola até o fim em passos, deixando cada ScrollTrigger disparar
    const total = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < total; y += Math.round(h * 0.6)) {
      await page.evaluate((yy) => window.scrollTo(0, yy), y);
      await new Promise((r) => setTimeout(r, 260));
    }
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await new Promise((r) => setTimeout(r, 1200));
    await page.evaluate(() => window.scrollTo(0, 0));
    await new Promise((r) => setTimeout(r, 800));
    await page.screenshot({ path: `${out}/${name}-full.png`, fullPage: true });
    const info = await page.evaluate(() => {
      const w = window.innerWidth; const bad = [];
      document.querySelectorAll("body *").forEach((el) => { const r = el.getBoundingClientRect(); if (r.width > 0 && (r.right > w + 1 || r.left < -1) && getComputedStyle(el).position !== "fixed") { let p = el.parentElement, clipped = false; while (p) { const o = getComputedStyle(p).overflowX; if (o === "hidden" || o === "clip") { clipped = true; break; } p = p.parentElement; } if (!clipped) bad.push(`${el.tagName.toLowerCase()}.${[...el.classList].join(".")} ${Math.round(r.left)}..${Math.round(r.right)}`); } });
      return { h: document.documentElement.scrollHeight, overflowX: document.documentElement.scrollWidth > w, bad: bad.slice(0, 12) };
    });
    console.log(`${name}: altura ${info.h}px${info.overflowX ? " · ESTOURO HORIZONTAL" : ""}${info.bad.length ? "\n  fora da tela: " + info.bad.join(" | ") : ""}${errors.length ? "\n  erros: " + errors.join(" | ") : ""}`);
    await page.close();
  }
}
await browser.close();
