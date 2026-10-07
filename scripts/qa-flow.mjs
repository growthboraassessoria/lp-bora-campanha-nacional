// QA funcional: faz um cadastro completo pelo painel (CEP → confirmar → dados → enviar), confere o /obrigado,
// o link de indicação, a página da cidade, o ranking e o story. Usa o Chrome local.
import puppeteer from "puppeteer-core";
import { mkdirSync } from "node:fs";

const out = process.argv[2] ?? "/tmp/lp-flow";
const base = process.argv[3] ?? "http://localhost:3000";
mkdirSync(out, { recursive: true });
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ["--no-sandbox", "--hide-scrollbars"] });
const page = await browser.newPage();
const errors = [];
page.on("response", (r) => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`); });
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text().slice(0, 160)); });
page.on("pageerror", (e) => errors.push("pageerror: " + String(e).slice(0, 160)));
await page.setViewport({ width: 1440, height: 900 });
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

await page.goto(base + "/?utm_source=qa&utm_medium=script", { waitUntil: "networkidle0" });
await wait(3500);
await page.type("#cadastro-cep", "74120010", { delay: 40 });
await page.waitForSelector(".confirm__name", { timeout: 15000 });
await wait(800);
await page.evaluate(() => document.querySelector("#cadastro")?.scrollIntoView({ block: "center" }));
await wait(600);
await page.screenshot({ path: `${out}/1-cep-confirmado.png` });
console.log("cidade:", await page.$eval(".confirm__name", (e) => e.textContent), await page.$eval(".confirm__uf", (e) => e.textContent));
await page.click(".confirm__actions .btn");
await page.waitForSelector("#cadastro-first_name", { timeout: 5000 });
await wait(900);
const stamp = Date.now().toString().slice(-6);
await page.type("#cadastro-first_name", "Teste", { delay: 20 });
await page.type("#cadastro-last_name", "QA", { delay: 20 });
await page.type("#cadastro-phone", `62 9${stamp.slice(0, 4)}${stamp.slice(2, 6)}`, { delay: 20 });
await page.type("#cadastro-email", `qa${stamp}@example.com`, { delay: 20 });
await page.click("#cadastro .consent input");
await wait(400);
await page.screenshot({ path: `${out}/2-dados.png` });
await Promise.all([page.waitForNavigation({ waitUntil: "networkidle0", timeout: 20000 }), page.click("#cadastro button[type=submit]")]);
await wait(2500);
console.log("após enviar:", page.url());
await page.screenshot({ path: `${out}/3-obrigado.png`, fullPage: true });
const link = await page.$eval("#share-link-text", (e) => e.textContent?.trim());
console.log("link pessoal:", link);
const code = link?.split("/r/")[1];

// link de indicação: deve registrar o clique e voltar para a home com ?ref=
const res = await page.goto(`${base}/r/${code}`, { waitUntil: "networkidle0" });
console.log("após /r:", page.url(), res.status());
const cookies = await page.cookies();
console.log("cookies:", cookies.map((c) => c.name).join(", "));

// página da cidade, ranking e story
await page.goto(`${base}/cidade/go-goiania`, { waitUntil: "networkidle0" });
await wait(2500);
await page.screenshot({ path: `${out}/4-cidade.png`, fullPage: true });
await page.goto(`${base}/ranking`, { waitUntil: "networkidle0" });
await wait(2500);
await page.screenshot({ path: `${out}/5-ranking.png`, fullPage: true });
const story = await page.goto(`${base}/api/story?c=${code}`);
console.log("story:", story.status(), story.headers()["content-type"]);
await page.screenshot({ path: `${out}/6-story.png` });
await page.goto(`${base}/fundador`, { waitUntil: "networkidle0" });
await wait(2000);
await page.screenshot({ path: `${out}/7-fundador.png`, fullPage: true });
console.log(errors.length ? "erros de console: " + errors.join(" | ") : "sem erros de console");
await browser.close();
