// BORA ID: número nacional, sequencial, estável. A pessoa vê "#0001"; o código de indicação segue como apelido do link.
export function formatBoraId(n: number | null | undefined) {
  if (!n || n < 1) return "#----";
  return `#${String(n).padStart(4, "0")}`;
}

/** Data no formato brasileiro a partir de ISO (sem fuso: só a parte da data). */
export function formatDateBr(iso: string | null | undefined) {
  if (!iso) return "";
  const [y, m, d] = iso.slice(0, 10).split("-");
  return d && m && y ? `${d}/${m}/${y}` : "";
}
