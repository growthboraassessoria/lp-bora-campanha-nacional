// QA da versão dos EUA (/us): página em inglês, ZIP code, cadastro sem CPF, obrigado, carteirinha, story, link de indicação,
// sair, entrar com celular e data de nascimento, perfil público e página da cidade. Usa o Chrome local.
// Uso: node scripts/qa-us.mjs [pasta] [base]
import puppeteer from "puppeteer-core";
import { mkdirSync, writeFileSync } from "node:fs";

const out = process.argv[2] ?? "/tmp/lp-us";
const base = process.argv[3] ?? "http://localhost:3000";
mkdirSync(out, { recursive: true });
const CHROME = process.env.CHROME ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ["--no-sandbox", "--hide-scrollbars"] });
const page = await browser.newPage();
const errors = [];
const fails = [];
page.on("response", (r) => { if (r.status() >= 400 && !r.url().includes("/favicon")) errors.push(`${r.status()} ${r.url()}`); });
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text().slice(0, 160)); });
page.on("pageerror", (e) => errors.push("pageerror: " + String(e).slice(0, 160)));
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const check = (name, ok, detail = "") => { console.log(`${ok ? "ok  " : "FALHA"} ${name}${detail ? " · " + detail : ""}`); if (!ok) fails.push(name); };
// Texto em português que sobrou na página: acento que o inglês não usa ou palavras comuns.
const ptLeft = () => page.evaluate(() => {
  const hits = new Set();
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const t = n.textContent.trim();
    if (!t || n.parentElement.closest("script,style,[data-nextjs-toast],nextjs-portal")) continue;
    if (/[ãõçáéíóúâêô]/i.test(t) || /\b(você|cidade|cadastro|sua|seu|não|para|pessoas|mapa)\b/i.test(t)) hits.add(t.slice(0, 60));
  }
  return [...hits];
});

await page.setViewport({ width: 1440, height: 900 });
await page.goto(base + "/us?v=A&utm_source=qa&utm_medium=script", { waitUntil: "networkidle0" });
await wait(4500);
check("idioma do documento", (await page.$eval("html", (e) => e.lang)) === "en-US");
check("manchete em inglês", (await page.$eval("#hero-title", (e) => e.textContent)).includes("IN YOUR"));
check("mapa dos EUA com 51 estados", (await page.$$eval(".hero__map .map-state", (e) => e.length)) === 51, await page.$eval(".hero__map svg", (e) => e.getAttribute("viewBox")));
check("sem oferta (Founding 50)", !(await page.$(".founding")));
check("legenda com a praça (Miami) e sem a de redes", !!(await page.$(".hero__legend-unit")) && !(await page.$(".hero__legend-signal")) && (await page.$$(".hero__map .map-unit")).length === 1);
await page.screenshot({ path: `${out}/1-home.png` });
for (let y = 0; y < 16000; y += 700) { await page.evaluate((y) => window.scrollTo(0, y), y); await wait(120); }
await wait(800);
let pt = await ptLeft();
check("home sem texto em português", pt.length === 0, pt.slice(0, 6).join(" | "));
await page.screenshot({ path: `${out}/1-home-full.png`, fullPage: true });
await page.evaluate(() => window.scrollTo(0, 0));
await wait(500);

// ZIP code → cidade → dados
await page.type("#cadastro-cep", "78701", { delay: 40 });
await page.waitForSelector(".confirm__name", { timeout: 15000 });
await wait(1800);
check("ZIP 78701 resolve Austin TX", (await page.$eval(".confirm__name", (e) => e.textContent)) === "Austin" && (await page.$eval(".confirm__uf", (e) => e.textContent)) === "TX");
await page.evaluate(() => window.scrollTo(0, 0));
await wait(400);
await page.screenshot({ path: `${out}/2-zip.png` });
await page.click(".confirm__actions .btn");
await page.waitForSelector("#cadastro-first_name", { timeout: 5000 });
await wait(900);
check("sem campo de CPF", !(await page.$("#cadastro-cpf")));
check("aceite de texto separado e desmarcado", (await page.$eval("#cadastro-sms", (e) => e.checked)) === false);
const stamp = Date.now().toString().slice(-6);
const phone = `512555${stamp.slice(0, 4)}`;
await page.type("#cadastro-first_name", "Tester", { delay: 15 });
await page.type("#cadastro-last_name", "Qa", { delay: 15 });
await page.type("#cadastro-phone", phone, { delay: 15 });
await page.type("#cadastro-email", `qa-us-${stamp}@example.com`, { delay: 15 });
await page.type("#cadastro-birth_date", "05101990", { delay: 15 });
await page.click("#cadastro-sex-F");
check("máscara do celular", /^\(512\) 555-\d{4}$/.test(await page.$eval("#cadastro-phone", (e) => e.value)), await page.$eval("#cadastro-phone", (e) => e.value));
await page.click("#cadastro-consent");
await page.evaluate(() => document.querySelector("#cadastro")?.scrollIntoView({ block: "center" }));
await wait(400);
await page.screenshot({ path: `${out}/3-form.png` });
await Promise.all([page.waitForNavigation({ waitUntil: "networkidle0", timeout: 25000 }), page.click("#cadastro button[type=submit]")]);
await wait(2500);
check("vai para /us/thanks", new URL(page.url()).pathname === "/us/thanks", page.url());
const boraId = await page.$eval(".boraid__num", (e) => e.textContent?.trim()).catch(() => null);
check("BORA ID na carteirinha", /^#\d{4,}$/.test(boraId ?? ""), boraId ?? "");
check("cidade e estado na carteirinha", (await page.$eval(".boraid__city", (e) => e.textContent)).replace(/\s+/g, " ").includes("Austin · TX"));
check("data no formato dos EUA", /^\d{2}\/\d{2}\/\d{4}$/.test(await page.$eval(".boraid__v", (e) => e.textContent.trim())), await page.$eval(".boraid__v", (e) => e.textContent.trim()));
const shareHref = await page.$eval(".share__btns a", (e) => e.getAttribute("href"));
check("compartilhar por mensagem de texto", shareHref.startsWith("sms:?&body="), shareHref.slice(0, 40));
check("sem bloco de grupo e de Fundador", !(await page.$("#group-title")) && !(await page.$("#founder-title")));
pt = await ptLeft();
check("obrigado sem texto em português", pt.length === 0, pt.slice(0, 6).join(" | "));
await page.screenshot({ path: `${out}/4-thanks.png`, fullPage: true });
const link = await page.$eval("#share-link-text", (e) => e.textContent?.trim());
const code = link?.split("/r/")[1];

const card = await page.goto(`${base}/api/carteirinha`);
check("carteirinha em PNG", card.status() === 200 && card.headers()["content-type"] === "image/png");
await page.screenshot({ path: `${out}/5-card.png` });
const story = await page.goto(`${base}/api/story?c=${code}`);
check("story em PNG", story.status() === 200 && story.headers()["content-type"] === "image/png");
await page.screenshot({ path: `${out}/6-story.png` });
await page.goto(`${base}/r/${code}`, { waitUntil: "networkidle0" });
check("link de indicação leva para /us", new URL(page.url()).pathname === "/us" && page.url().includes(`ref=${code}`), page.url());

// sair, entrar com celular + data, perfil
await page.evaluate(() => fetch("/api/sair?l=us", { method: "POST", redirect: "manual" }));
await wait(500);
await page.goto(`${base}/us/me`, { waitUntil: "networkidle0" });
check("sem sessão, /us/me pede login", new URL(page.url()).pathname === "/us/login", page.url());
await page.type("#login-id", phone, { delay: 15 });
await page.type("#login-birth", "05111990", { delay: 15 });
await page.click(".login .btn");
await page.waitForFunction(() => document.querySelector(".login .panel__err"), { timeout: 15000 });
check("data errada não entra", (await page.$eval(".login .panel__err", (e) => e.textContent)).includes("don't match"));
errors.length = 0; // a recusa acima é esperada
await page.$eval("#login-birth", (e) => (e.value = ""));
await page.click("#login-birth", { clickCount: 3 });
await page.keyboard.press("Backspace");
await page.type("#login-birth", "05101990", { delay: 15 });
await Promise.all([page.waitForNavigation({ waitUntil: "networkidle0", timeout: 20000 }), page.click(".login .btn")]);
await wait(2500);
check("entra com celular e data de nascimento", new URL(page.url()).pathname === "/us/me", page.url());
await page.screenshot({ path: `${out}/7-me.png`, fullPage: true });
const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAIAAAAlC+aJAAAAJklEQVR4nO3NMQEAAAgDoK1/aM3g4QcFaCbAAAAAAAAAAAAAAM8GJ+gAAfP8HtQAAAAASUVORK5CYII=", "base64");
writeFileSync(`${out}/avatar.png`, png);
await (await page.$("#perfil-foto")).uploadFile(`${out}/avatar.png`);
await wait(800);
await page.type("#perfil-instagram", "@tester.qa", { delay: 10 });
await page.type("#perfil-bio", "QA test profile.", { delay: 10 });
await page.click("#perfil-publico");
await page.click("#perfil-whatsapp");
await page.click(".profile button[type=submit]");
await page.waitForFunction(() => /saved|wrong|Check|couldn't/.test(document.querySelector(".profile .panel__micro")?.textContent ?? ""), { timeout: 20000 });
check("perfil salvo", (await page.$eval(".profile .panel__micro", (e) => e.textContent?.trim())) === "Profile saved.");
pt = await ptLeft();
check("área do membro sem texto em português", pt.length === 0, pt.slice(0, 6).join(" | "));

await page.goto(`${base}/us/city/tx-austin`, { waitUntil: "networkidle0" });
await wait(2500);
check("página da cidade", (await page.$eval("h1", (e) => e.textContent)).toUpperCase().includes("BORA AUSTIN"));
const member = await page.$eval(".member .member__name", (e) => e.textContent?.trim()).catch(() => null);
const contact = await page.$$eval(".member__links a", (as) => as.map((a) => `${a.textContent?.trim()}=${a.getAttribute("href")?.slice(0, 16)}`)).catch(() => []);
check("membro público com botão de texto", member === "Tester Q." && contact.some((c) => c.startsWith("TEXT=sms:+1512555")), `${member} ${contact.join(" ")}`);
pt = await ptLeft();
check("cidade sem texto em português", pt.length === 0, pt.slice(0, 6).join(" | "));
await page.screenshot({ path: `${out}/8-city.png`, fullPage: true });

// O ranking tem cache de 60 s no servidor: espera a cidade nova aparecer.
let rows = [];
for (let i = 0; i < 16; i++) {
  await page.goto(`${base}/us/ranking`, { waitUntil: "networkidle0" });
  await wait(1500);
  rows = await page.$$eval(".row__city", (e) => e.map((x) => x.textContent.replace(/\s+/g, " ").trim()));
  if (rows.some((r) => r.startsWith("Austin"))) break;
  await wait(5000);
}
check("ranking dos EUA só com cidades dos EUA", rows.length > 0 && rows.every((r) => !/Goi|Bras/.test(r)) && rows.some((r) => r.startsWith("Austin")), rows.slice(0, 4).join(", "));
await page.screenshot({ path: `${out}/9-ranking.png`, fullPage: true });
await page.goto(`${base}/ranking`, { waitUntil: "networkidle0" });
const brRows = await page.$$eval(".row__city", (e) => e.map((x) => x.textContent.replace(/\s+/g, " ").trim()));
check("ranking do Brasil sem cidades dos EUA", brRows.every((r) => !r.startsWith("Austin")), brRows.slice(0, 4).join(", "));

// regras do servidor (as recusas abaixo são esperadas: não contam como erro de console)
const before = errors.length;
const api = (path, body) => page.evaluate(async (path, body) => { const r = await fetch(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }); return { status: r.status, json: await r.json().catch(() => null) }; }, path, body);
const young = await api("/api/lead", { country: "US", first_name: "Kid", last_name: "Test", phone: "5125550199", email: `kid-${stamp}@example.com`, cep: "78701", sex: "N", birth_date: `01/01/${new Date().getFullYear() - 12}`, privacy_consent: true });
check("menor de 13 anos é recusado", young.status === 400 && !!young.json?.errors?.birth_date, JSON.stringify(young.json?.errors ?? young.json));
const brLogin = await api("/api/entrar", { cpf: phone, birth_date: "10/05/1990" });
check("celular dos EUA não entra pela porta do Brasil", brLogin.status >= 400);

errors.length = before;

// celular: página inicial e mapa
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
await page.goto(base + "/us?v=B", { waitUntil: "networkidle0" });
await wait(4000);
const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
check("celular sem estouro horizontal", !overflow);
await page.screenshot({ path: `${out}/10-home-mobile.png` });
await page.evaluate(() => document.querySelector(".hero__map")?.scrollIntoView({ block: "center" }));
await wait(600);
await page.screenshot({ path: `${out}/11-map-mobile.png` });

console.log(errors.length ? "erros de console: " + [...new Set(errors)].join(" | ") : "sem erros de console");
console.log(fails.length ? `\n${fails.length} FALHA(S): ${fails.join("; ")}` : "\nTudo certo.");
await browser.close();
process.exit(fails.length ? 1 : 0);
