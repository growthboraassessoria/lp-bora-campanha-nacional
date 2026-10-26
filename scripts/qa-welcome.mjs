// Página de obrigado: cadastro → delay → perguntas → grupo. Duas rodadas: respondendo (desktop) e pulando (celular).
// Lê as respostas em .data/db.json, então roda só contra um servidor local sem Supabase:
// SUPABASE_URL= SUPABASE_SERVICE_ROLE_KEY= npx next dev -p 3310 && node scripts/qa-welcome.mjs <pasta> http://localhost:3310
import puppeteer from "puppeteer-core";
import { mkdirSync, readFileSync } from "node:fs";
const out = process.argv[2] ?? "/tmp/lp-welcome";
const base = process.argv[3] ?? "http://localhost:3000";
mkdirSync(out, { recursive: true });
const browser = await puppeteer.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: true, args: ["--no-sandbox"] });
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
function cpfValido() {
  const n = []; for (let i = 0; i < 9; i++) n.push(Math.floor(Math.random() * 10));
  const dv = (len) => { let s = 0; for (let i = 0; i < len; i++) s += n[i] * (len + 1 - i); const r = (s * 10) % 11; return r === 10 ? 0 : r; };
  n.push(dv(9)); n.push(dv(10)); return n.join("");
}
async function signup(page, tag) {
  await page.goto(base + "/", { waitUntil: "networkidle0" });
  await wait(3500);
  await page.type("#cadastro-cep", "74120010", { delay: 30 });
  await page.waitForSelector(".confirm__name", { timeout: 15000 });
  await wait(900);
  await page.click(".confirm__actions .btn");
  await page.waitForSelector("#cadastro-first_name");
  await wait(900);
  const stamp = (Date.now() + tag).toString().slice(-6);
  await page.type("#cadastro-first_name", "Teste");
  await page.type("#cadastro-last_name", "QA");
  await page.type("#cadastro-phone", `62 9${stamp.slice(0, 4)}${stamp.slice(2, 6)}`);
  const email = `qa${stamp}@example.com`;
  await page.type("#cadastro-email", email);
  await page.type("#cadastro-cpf", cpfValido());
  await page.type("#cadastro-birth_date", "10051990");
  await page.click("#cadastro-sex-F");
  await page.click("#cadastro .consent input");
  await Promise.all([page.waitForNavigation({ waitUntil: "networkidle0", timeout: 20000 }), page.click("#cadastro button[type=submit]")]);
  return email;
}
let fails = 0;
const check = (ok, msg) => { if (!ok) fails++; console.log(ok ? "ok  " : "FALHA", msg); };
for (const [i, mode, w, h] of [[1, "responde", 1440, 900], [2, "pula", 390, 844]]) {
  const page = await browser.newPage();
  await page.setViewport({ width: w, height: h, isMobile: w < 600, hasTouch: w < 600 });
  const email = await signup(page, i);
  await wait(2000);
  check(!(await page.$(".welcome__card--qual:not([style*='hidden'])")) || (await page.$eval(".welcome", (e) => e.dataset.welcomePhase)) === "delay", `${mode}: durante a delay as perguntas ainda não aparecem`);
  await page.waitForSelector('[data-welcome-phase="popup"]', { timeout: 8000 });
  await wait(900);
  check(!!(await page.$(".welcome__card--qual .chip")), `${mode}: depois da delay vêm as perguntas`);
  check(!(await page.$("#welcome-join")), `${mode}: o grupo ainda não aparece`);
  await page.screenshot({ path: `${out}/${i}-perguntas-1.png` });
  if (mode === "responde") {
    for (const q of await page.$$(".welcome__card--qual .qual__q")) { const c = await q.$(".chip"); if (c) await c.click(); }
    await page.click(".qual__actions .btn");
    await wait(500);
    await page.screenshot({ path: `${out}/${i}-perguntas-2.png` });
    for (const q of await page.$$(".welcome__card--qual .qual__q")) { const c = await q.$(".chip"); if (c) await c.click(); else { const inp = await q.$("input"); await inp.type("Clube QA"); } }
    await page.click(".qual__actions .btn");
  } else {
    await page.click(".welcome__card--qual .welcome__skip");
  }
  await page.waitForSelector("#welcome-join", { timeout: 5000 }).catch(() => null);
  await wait(500);
  check(!!(await page.$("#welcome-join")), `${mode}: depois das perguntas vem o grupo`);
  await page.screenshot({ path: `${out}/${i}-grupo.png` });
  if (await page.$(".welcome__card .welcome__skip")) await page.click(".welcome__card .welcome__skip"); else await page.click("#welcome-join");
  await wait(800);
  check((await page.$eval("html", (e) => e.classList.contains("welcome-done"))), `${mode}: o pop-up fecha e mostra a página de obrigado`);
  const db = JSON.parse(readFileSync(".data/db.json", "utf8"));
  const lead = db.leads.find((l) => l.email === email);
  const answers = (db.qualification ?? []).filter((a) => a.lead_id === lead?.id);
  check(mode === "responde" ? answers.length === 9 : answers.length === 0, `${mode}: ${answers.length} respostas gravadas`);
  // Recarregar não repete a delay nem as perguntas na mesma sessão.
  await page.reload({ waitUntil: "networkidle0" });
  await wait(1200);
  check(await page.$eval("html", (e) => e.classList.contains("welcome-done")), `${mode}: recarregar não repete`);
  // Outro cadastro na mesma aba (o caso do Alex em 26/10): a delay e as perguntas aparecem de novo.
  await signup(page, i + 10);
  const again = await page.waitForSelector('[data-welcome-phase="popup"]', { timeout: 9000 }).then(() => true, () => false);
  await wait(900);
  check(again && !!(await page.$(".welcome__card--qual .chip")), `${mode}: novo cadastro na mesma aba mostra a delay e as perguntas`);
  await page.close();
}
await browser.close();
process.exit(fails ? 1 : 0);
