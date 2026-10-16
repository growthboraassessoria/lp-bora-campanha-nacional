// Confere o caminho da aula experimental: CEP ou ZIP de praça com BORA mostra a oferta e o link certo;
// praça sem página de aula segue para o site; cidade sem BORA segue para o cadastro.
// Uso: node scripts/qa-trial.mjs [base]
import puppeteer from "puppeteer-core";
const base = process.argv[2] ?? "http://localhost:3000";
const CHROME = process.env.CHROME ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ["--no-sandbox"] });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
const cases = [
  ["/", "01310100", "aula-experimental-sao-paulo"],
  ["/", "12245000", "aula-experimental-sao-jose-dos-campos"],
  ["/", "59020300", "aula-experimental-natal"],
  ["/", "50030230", "aula-experimental-recife"],
  ["/", "30130010", "site"],
  ["/", "74120010", "cadastro"],
  ["/", "72220041", "cadastro"],
  ["/us", "33130", "aula-experimental-miami"],
  ["/us", "78701", "cadastro"],
];
let fails = 0;
for (const [path, code, expect] of cases) {
  await page.goto(base + path + "?v=A", { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 2200));
  await page.type("#cadastro-cep", code, { delay: 25 });
  await page.waitForFunction(() => document.querySelector(".confirm__name") || document.querySelector(".unit__title"), { timeout: 20000 });
  const r = await page.evaluate(() => ({
    unit: document.querySelector(".unit__title")?.textContent ?? null,
    city: document.querySelector(".confirm__name")?.textContent ?? null,
    href: document.querySelector(".confirm__actions a")?.getAttribute("href") ?? null,
    cta: document.querySelector(".confirm__actions a, .confirm__actions .btn")?.textContent ?? null,
  }));
  const got = r.unit ? (r.href?.includes("aula-experimental") ? r.href.split("/")[3].split("?")[0] : "site") : "cadastro";
  const ok = got === expect && (!r.href?.includes("aula-experimental") || r.href.includes("utm_source=lp-vamos-em-frente"));
  if (!ok) fails++;
  console.log(`${ok ? "ok  " : "FALHA"} ${path} ${code} → ${got}${r.unit ? ` · "${r.unit}" · ${r.cta}` : ` · ${r.city}`}`);
}
await browser.close();
process.exit(fails ? 1 : 0);
