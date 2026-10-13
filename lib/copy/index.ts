// Os textos da campanha por país. `getCopy(locale)` devolve o conjunto certo; os componentes de navegador
// usam `useCopy()` (components/LocaleProvider). Os nomes exportados aqui direto são os do Brasil, para o código
// que só existe lá (página do Fundador, por exemplo).
import * as br from "./br";
import * as us from "./us";
import type { Locale } from "@/lib/locale";

export type Copy = typeof br;

const ALL: Record<Locale, Copy> = { br, us };

export function getCopy(locale: Locale = "br"): Copy {
  return ALL[locale] ?? br;
}

export function fill(template: string, vars: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ""));
}

export * from "./br";
