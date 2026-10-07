// Lista os elementos que passam da borda direita da tela (sem ancestral que recorte), para caçar estouro horizontal.
// Uso: CHROME="/caminho/do/chrome" node scripts/qa-overflow.mjs [url] [largura]
import puppeteer from "puppeteer-core";
const CHROME = process.env.CHROME ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const url = process.argv[2] ?? "http://localhost:3000/";
const width = Number(process.argv[3] ?? 390);
const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ["--no-sandbox"] });
const page = await browser.newPage();
await page.setViewport({ width, height: 844, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
await page.goto(url, { waitUntil: "networkidle0" });
for (let y = 0; y < 14000; y += 600) { await page.evaluate((y) => window.scrollTo(0, y), y); await new Promise((r) => setTimeout(r, 100)); }
const info = await page.evaluate(() => {
  const w = window.innerWidth; const out = [];
  document.querySelectorAll("body *").forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.width > 0 && r.right > w + 1 && getComputedStyle(el).position !== "fixed") {
      let p = el.parentElement, clipper = null;
      while (p && p !== document.body) { const o = getComputedStyle(p).overflowX; if (o === "hidden" || o === "clip" || o === "auto" || o === "scroll") { clipper = p; break; } p = p.parentElement; }
      if (!clipper) out.push(`${el.tagName.toLowerCase()}.${[...el.classList].join(".")} right=${Math.round(r.right)} w=${Math.round(r.width)} text=${(el.textContent ?? "").trim().slice(0, 30)}`);
    }
  });
  return { innerWidth: w, scrollWidth: document.documentElement.scrollWidth, out: out.slice(0, 24) };
});
console.log(JSON.stringify(info, null, 1));
await browser.close();
