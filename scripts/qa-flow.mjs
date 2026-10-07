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
// CPF sintético com dígitos verificadores válidos, só para o teste.
function cpfValido() {
  const n = [];
  for (let i = 0; i < 9; i++) n.push(Math.floor(Math.random() * 10));
  const dv = (len) => { let s = 0; for (let i = 0; i < len; i++) s += n[i] * (len + 1 - i); const r = (s * 10) % 11; return r === 10 ? 0 : r; };
  n.push(dv(9)); n.push(dv(10));
  return n.join("");
}

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
const cpfUsado = cpfValido();
await page.type("#cadastro-cpf", cpfUsado, { delay: 15 });
await page.type("#cadastro-birth_date", "10051990", { delay: 15 });
await page.click("#cadastro-sex-F");
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
const boraId = await page.$eval(".boraid__num", (e) => e.textContent?.trim()).catch(() => null);
console.log("BORA ID:", boraId);
const card = await page.goto(`${base}/api/carteirinha`);
console.log("carteirinha:", card.status(), card.headers()["content-type"]);
await page.screenshot({ path: `${out}/3b-carteirinha.png` });

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
// área do membro: sair, entrar com CPF e data, editar perfil com foto e perfil público, conferir na página da cidade
await page.setViewport({ width: 1440, height: 900 });
await page.goto(`${base}/eu`, { waitUntil: "networkidle0" });
await page.evaluate(() => fetch("/api/sair", { method: "POST", redirect: "manual" }));
await wait(500);
await page.goto(`${base}/eu`, { waitUntil: "networkidle0" });
console.log("sem cookie, /eu leva para:", page.url());
await page.type("#login-cpf", cpfUsado, { delay: 15 });
await page.type("#login-birth", "10051990", { delay: 15 });
await Promise.all([page.waitForNavigation({ waitUntil: "networkidle0", timeout: 20000 }), page.click(".login .btn")]);
await wait(2500);
console.log("após entrar:", page.url());
await page.screenshot({ path: `${out}/10-minha-area.png`, fullPage: true });
const { writeFileSync } = await import("node:fs");
const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAIAAAAlC+aJAAAAJklEQVR4nO3NMQEAAAgDoK1/aM3g4QcFaCbAAAAAAAAAAAAAAM8GJ+gAAfP8HtQAAAAASUVORK5CYII=", "base64");
writeFileSync(`${out}/avatar.png`, png);
const fileInput = await page.$("#perfil-foto");
await fileInput.uploadFile(`${out}/avatar.png`);
await wait(800);
await page.type("#perfil-instagram", "@teste.qa", { delay: 10 });
await page.type("#perfil-bio", "Perfil de teste do QA.", { delay: 10 });
await page.click("#perfil-publico");
await page.click("#perfil-whatsapp");
await page.click(".profile button[type=submit]");
await page.waitForFunction(() => /Perfil salvo|Deu ruim|Confere|Não deu/.test(document.querySelector(".profile .panel__micro")?.textContent ?? ""), { timeout: 20000 });
console.log("perfil:", await page.$eval(".profile .panel__micro", (e) => e.textContent?.trim()));
await page.screenshot({ path: `${out}/11-perfil-salvo.png`, fullPage: true });
await page.goto(`${base}/cidade/go-goiania`, { waitUntil: "networkidle0" });
await wait(2000);
const membro = await page.$eval(".member .member__name", (e) => e.textContent?.trim()).catch(() => null);
const links = await page.$$eval(".member__links a", (as) => as.map((a) => a.textContent?.trim())).catch(() => []);
console.log("membro público na cidade:", membro, links.join("/"));
await page.evaluate(() => document.querySelector(".members")?.scrollIntoView({ block: "start" }));
await wait(600);
await page.screenshot({ path: `${out}/12-membros-cidade.png` });

// CEP de cidade onde a BORA já está: deve mostrar o aviso e o botão para o site, sem seguir o cadastro
await page.setViewport({ width: 1440, height: 900 });
await page.goto(base + "/", { waitUntil: "networkidle0" });
await wait(2500);
await page.type("#cadastro-cep", "30130010", { delay: 30 });
await page.waitForSelector(".unit__title", { timeout: 15000 });
console.log("cidade com BORA:", await page.$eval(".unit__title", (e) => e.textContent), "·", await page.$eval(".unit .btn", (e) => e.getAttribute("href")));
await page.evaluate(() => document.querySelector("#cadastro")?.scrollIntoView({ block: "center" }));
await wait(500);
await page.screenshot({ path: `${out}/9-cidade-com-bora.png` });

// CEP liberado em praça com BORA (teste do Alex): deve confirmar a cidade normalmente
await page.goto(base + "/", { waitUntil: "networkidle0" });
await wait(2500);
await page.type("#cadastro-cep", "72220041", { delay: 30 });
await page.waitForSelector(".confirm__name", { timeout: 15000 });
console.log("CEP liberado:", await page.$eval(".confirm__name", (e) => e.textContent), await page.$eval(".confirm__uf", (e) => e.textContent), "· passo:", await page.$(".unit__title") ? "praça com BORA (ERRADO)" : "confirmar cidade");

// a carteirinha no celular
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
await page.goto(`${base}/obrigado`, { waitUntil: "networkidle0" });
await wait(2500);
await page.evaluate(() => document.querySelector(".boraid")?.scrollIntoView({ block: "start" }));
await wait(800);
await page.screenshot({ path: `${out}/8-obrigado-celular.png` });
console.log(errors.length ? "erros de console: " + errors.join(" | ") : "sem erros de console");
await browser.close();
