// Gera lib/geo/us-states.ts: contornos dos 50 estados e de DC, já projetados (Albers USA, com Alasca e Havaí em quadros),
// no espaço 0..400 de largura. Fonte: us-atlas (U.S. Census Bureau, domínio público). Rodar: node scripts/build-us-geo.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { feature } from "topojson-client";
import { presimplify, simplify } from "topojson-simplify";

const FIPS = { "01": ["AL", "Alabama"], "02": ["AK", "Alaska"], "04": ["AZ", "Arizona"], "05": ["AR", "Arkansas"], "06": ["CA", "California"], "08": ["CO", "Colorado"], "09": ["CT", "Connecticut"], "10": ["DE", "Delaware"], "11": ["DC", "District of Columbia"], "12": ["FL", "Florida"], "13": ["GA", "Georgia"], "15": ["HI", "Hawaii"], "16": ["ID", "Idaho"], "17": ["IL", "Illinois"], "18": ["IN", "Indiana"], "19": ["IA", "Iowa"], "20": ["KS", "Kansas"], "21": ["KY", "Kentucky"], "22": ["LA", "Louisiana"], "23": ["ME", "Maine"], "24": ["MD", "Maryland"], "25": ["MA", "Massachusetts"], "26": ["MI", "Michigan"], "27": ["MN", "Minnesota"], "28": ["MS", "Mississippi"], "29": ["MO", "Missouri"], "30": ["MT", "Montana"], "31": ["NE", "Nebraska"], "32": ["NV", "Nevada"], "33": ["NH", "New Hampshire"], "34": ["NJ", "New Jersey"], "35": ["NM", "New Mexico"], "36": ["NY", "New York"], "37": ["NC", "North Carolina"], "38": ["ND", "North Dakota"], "39": ["OH", "Ohio"], "40": ["OK", "Oklahoma"], "41": ["OR", "Oregon"], "42": ["PA", "Pennsylvania"], "44": ["RI", "Rhode Island"], "45": ["SC", "South Carolina"], "46": ["SD", "South Dakota"], "47": ["TN", "Tennessee"], "48": ["TX", "Texas"], "49": ["UT", "Utah"], "50": ["VT", "Vermont"], "51": ["VA", "Virginia"], "53": ["WA", "Washington"], "54": ["WV", "West Virginia"], "55": ["WI", "Wisconsin"], "56": ["WY", "Wyoming"] };

const W = 400, SRC_W = 975, SRC_H = 610, K = W / SRC_W;
const MIN_AREA = Number(process.argv[2] ?? 1.2); // px² no espaço de origem: quanto maior, mais simples
const MIN_RING = 6; // anéis (ilhas) menores que isso, em px² de origem, saem

const topo = JSON.parse(readFileSync("node_modules/us-atlas/states-albers-10m.json", "utf8"));
const simple = simplify(presimplify(topo), MIN_AREA);
const fc = feature(simple, simple.objects.states);

const area = (r) => { let a = 0; for (let i = 0, j = r.length - 1; i < r.length; j = i++) a += (r[j][0] * r[i][1] - r[i][0] * r[j][1]); return Math.abs(a / 2); };
const centroid = (r) => { let a = 0, cx = 0, cy = 0; for (let i = 0, j = r.length - 1; i < r.length; j = i++) { const f = r[j][0] * r[i][1] - r[i][0] * r[j][1]; a += f; cx += (r[j][0] + r[i][0]) * f; cy += (r[j][1] + r[i][1]) * f; } return a ? [cx / (3 * a), cy / (3 * a)] : r[0]; };
const n = (v) => (Math.round(v * K * 10) / 10).toString();

const states = [];
for (const f of fc.features) {
  const meta = FIPS[String(f.id).padStart(2, "0")];
  if (!meta) continue;
  const polys = f.geometry.type === "Polygon" ? [f.geometry.coordinates] : f.geometry.coordinates;
  const rings = polys.map((p) => p[0]).filter((r) => r.length >= 4);
  const biggest = rings.reduce((a, b) => (area(a) > area(b) ? a : b));
  let d = "";
  for (const r of rings) {
    if (r !== biggest && area(r) < MIN_RING) continue;
    let last = "";
    const pts = [];
    for (const [x, y] of r) { const s = `${n(x)} ${n(y)}`; if (s !== last) pts.push(s); last = s; }
    if (pts.length < 3) continue;
    d += `M${pts[0]} L${pts.slice(1).join(" L")} Z `;
  }
  const [cx, cy] = centroid(biggest);
  states.push({ uf: `US-${meta[0]}`, name: meta[1], d: d.trim(), cx: Math.round(cx * K * 10) / 10, cy: Math.round(cy * K * 10) / 10 });
}
states.sort((a, b) => a.uf.localeCompare(b.uf));
const H = Math.round(SRC_H * K);
const body = `// Contornos dos 50 estados dos EUA e de DC, já projetados (Albers USA, Alasca e Havaí em quadros) no espaço 0..${W} × 0..${H}.
// Fonte: us-atlas (U.S. Census Bureau, domínio público), simplificado. Gerado por scripts/build-us-geo.mjs; não editar à mão.
import type { StateShape } from "./states";
export const US_MAP = { width: ${W}, height: ${H} } as const;
export const US_STATES: StateShape[] = ${JSON.stringify(states)};
`;
writeFileSync("lib/geo/us-states.ts", body);
console.log(`${states.length} estados · ${(body.length / 1024).toFixed(1)} KB · ${W}×${H}`);
