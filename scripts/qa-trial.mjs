// Confere o caminho da aula experimental: CEP ou ZIP de praça com BORA pergunta se a pessoa já é aluna;
// "sim" vai para o site, "não" vai para a aula da praça (BH: escolhe Belvedere ou Pampulha).
// Praça sem página de aula segue para o site; cidade sem BORA segue para o cadastro.
// Uso: node scripts/qa-trial.mjs [base]
import puppeteer from "puppeteer-core";
const base = process.argv[2] ?? "http://localhost:3000";
const CHROME = process.env.CHROME ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ["--no-sandbox"] });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
const SITE = "https://boraassessoria.com/";
const cases = [
  ["/", "01310100", ["sao-paulo"]],
  ["/", "12245000", ["sao-jose-dos-campos"]],
  ["/", "13330060", ["indaiatuba"]],
  ["/", "30130010", ["belvedere", "pampulha"]],
  ["/", "33230010", ["lagoa-santa"]],
  ["/", "35590010", ["lagoa-da-prata"]],
  ["/", "35500071", ["divinopolis"]],
  ["/", "22430041", ["rio-de-janeiro"]],
  ["/", "29060670", ["vitoria"]],
  ["/", "88330083", ["balneario-camboriu"]],
  ["/", "59020300", ["natal"]],
  ["/", "50030230", ["recife"]],
  ["/", "35540000", "site"],
  ["/", "35900010", "site"],
  ["/", "72010000", "site"],
  ["/", "74120010", "cadastro"],
  ["/", "72220041", "cadastro"],
  ["/us", "33130", ["miami"]],
  ["/us", "78701", "cadastro"],
];
const hrefs = () => page.$$eval(".confirm__actions a", (as) => as.map((a) => a.getAttribute("href")));
const slugOf = (h) => h.split("aula-experimental-")[1].split("/")[0];
let fails = 0;
for (const [path, code, expect] of cases) {
  await page.goto(base + path + "?v=A", { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 2200));
  // Se a página ainda não estava pronta quando o CEP foi digitado, apaga e digita de novo.
  const answered = () => page.waitForFunction(() => document.querySelector(".confirm__name") || document.querySelector(".unit__title"), { timeout: 8000 }).then(() => true, () => false);
  for (let tries = 0; tries < 3; tries++) {
    await page.$eval("#cadastro-cep", (el) => { el.value = ""; });
    await page.type("#cadastro-cep", code, { delay: 25 });
    if (await answered()) break;
    if (tries === 2) throw new Error(`sem resposta para ${code}`);
  }
  const unit = await page.$(".unit__title");
  let got, detail = "";
  if (!unit) got = "cadastro";
  else if (!(await page.$(".unit__question"))) {
    const h = await hrefs();
    got = h.length === 1 && h[0] === SITE ? "site" : `sem pergunta: ${h.join(" ")}`;
  } else {
    detail = ` · ${await page.$eval(".unit__question", (e) => e.textContent)}`;
    const [yes, no] = await hrefs();
    let trial = no ? [no] : [];
    if (!no) {
      await new Promise((r) => setTimeout(r, 1200)); // espera a entrada animada do passo
      await page.click(".confirm__actions button.btn");
      await page.waitForSelector(".unit__trial");
      trial = await hrefs();
    }
    const utm = trial.every((h) => h.includes("utm_source=lp-vamos-em-frente"));
    got = yes === SITE && utm ? trial.map(slugOf) : `aluno→${yes} utm=${utm}`;
  }
  const ok = JSON.stringify(got) === JSON.stringify(expect);
  if (!ok) fails++;
  console.log(`${ok ? "ok  " : "FALHA"} ${path} ${code} → ${Array.isArray(got) ? got.join(" + ") : got}${detail}`);
}
await browser.close();
process.exit(fails ? 1 : 0);
