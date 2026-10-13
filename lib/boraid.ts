// BORA ID: número nacional, sequencial, estável. A pessoa vê "#0001"; o código de indicação segue como apelido do link.
export function formatBoraId(n: number | null | undefined) {
  if (!n || n < 1) return "#----";
  return `#${String(n).padStart(4, "0")}`;
}
