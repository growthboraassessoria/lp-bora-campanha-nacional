// Percorre rotas e lista respostas >= 400 e erros de console, para achar recursos quebrados.
// Uso: CHROME="/caminho/do/chrome" ROUTES="/,/ranking" node scripts/qa-404.mjs [base]
import puppeteer from "puppeteer-core";
const CHROME = process.env.CHROME ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const base = process.argv[2] ?? "http://localhost:3000";
const routes = (process.env.ROUTES ?? "/,/r/TESTE589,/?ref=TESTE589,/ranking,/fundador,/cidade/go-goiania,/obrigado,/privacidade,/termos,/nao-existe").split(",");
const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ["--no-sandbox"] });
const page = await browser.newPage();
const bad = [];
let current = "";
page.on("response", (r) => { if (r.status() >= 400) bad.push(`[${current}] ${r.status()} ${r.url()}`); });
page.on("console", (m) => { if (m.type() === "error") bad.push(`[${current}] console: ${m.text().slice(0, 140)}`); });
for (const r of routes) {
  current = r;
  await page.goto(base + r, { waitUntil: "networkidle0" });
  for (let y = 0; y < 12000; y += 800) { await page.evaluate((y) => window.scrollTo(0, y), y); await new Promise((res) => setTimeout(res, 80)); }
}
console.log(bad.length ? bad.join("\n") : "sem respostas >= 400 nem erros de console");
await browser.close();
