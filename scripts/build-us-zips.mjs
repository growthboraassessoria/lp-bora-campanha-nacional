// Gera data/us-zips.tsv a partir da base de códigos postais do GeoNames (CC BY 4.0, www.geonames.org).
// Uso: baixar https://download.geonames.org/export/zip/US.zip, extrair e rodar
//   node scripts/build-us-zips.mjs /caminho/US.txt
// Cada linha: ZIP \t cidade \t UF \t lat \t lng. Só os 50 estados e o Distrito de Columbia.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const STATES = new Set("AL AK AZ AR CA CO CT DE DC FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY".split(" "));
const src = process.argv[2];
if (!src) throw new Error("Informe o caminho do US.txt do GeoNames.");
const seen = new Set();
const out = [];
for (const line of readFileSync(src, "utf8").split("\n")) {
  const c = line.split("\t");
  if (c.length < 11) continue;
  const [, zip, place, , st, , , , , lat, lng] = c;
  if (!/^\d{5}$/.test(zip) || !STATES.has(st) || seen.has(zip)) continue;
  const la = Number(lat), ln = Number(lng);
  if (!Number.isFinite(la) || !Number.isFinite(ln)) continue;
  seen.add(zip);
  out.push([zip, place.trim(), st, la.toFixed(3), ln.toFixed(3)].join("\t"));
}
out.sort();
mkdirSync("data", { recursive: true });
writeFileSync("data/us-zips.tsv", out.join("\n") + "\n");
console.log(`${out.length} ZIP codes em data/us-zips.tsv`);
