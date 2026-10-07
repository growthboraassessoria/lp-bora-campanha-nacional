// Imprime as respostas das perguntas da LP e os números do BORA ID, lendo o banco vinculado pela CLI do Supabase.
// Uso: node scripts/respostas.mjs [UF]
import { execFileSync } from "node:child_process";

const LABELS = {
  runs: "Você já corre?",
  with: "Corre com quem?",
  distance: "Até que distância você corre hoje?",
  goal: "Qual seu objetivo?",
  open: "Participaria de um treino da BORA na sua cidade?",
  intent: "Treinaria com a BORA se ela existisse aqui?",
  price: "Quanto você pagaria por mês?",
  club: "Qual running club você frequenta?",
  company: "Onde você trabalha?",
};

function query(sql) {
  const out = execFileSync("supabase", ["db", "query", "--linked", "-o", "json", sql], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
  const json = JSON.parse(out.slice(out.indexOf("{")));
  return json.rows ?? [];
}

const uf = (process.argv[2] ?? "").toUpperCase().replace(/[^A-Z]/g, "");
const where = uf ? ` where state = '${uf}'` : "";
const [{ leads }] = query(`select count(*)::int as leads from leads${where}`);
const [{ ativos }] = query("select ativos from bora_ids_ativos");
const [{ ultimo }] = query("select coalesce(max(bora_number), 0)::int as ultimo from leads");
console.log(`Cadastros${uf ? ` em ${uf}` : ""}: ${leads} · último BORA ID: #${String(ultimo).padStart(4, "0")} · BORA IDs ativos (30 dias): ${ativos}`);

const rows = query(`select question, answer, sum(n)::int as n from qualification_summary${where} group by 1, 2 order by 1, 3 desc`);
let last = "";
for (const r of rows) {
  if (r.question !== last) {
    console.log(`\n${LABELS[r.question] ?? r.question}`);
    last = r.question;
  }
  console.log(`  ${String(r.n).padStart(4)}  ${r.answer}`);
}
if (!rows.length) console.log("\nNenhuma resposta ainda.");
