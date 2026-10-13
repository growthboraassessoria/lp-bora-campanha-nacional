"use client";
// Diz aos componentes de navegador em qual país a página está. O padrão é o Brasil; as páginas de /us
// são embrulhadas com `locale="us"` no layout delas.
import { createContext, useContext, type ReactNode } from "react";
import { getCopy, type Copy } from "@/lib/copy";
import { LOCALES, type Locale, type LocaleConfig } from "@/lib/locale";

const Ctx = createContext<Locale>("br");

export function LocaleProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  return <Ctx.Provider value={locale}>{children}</Ctx.Provider>;
}

export function useLocale(): Locale {
  return useContext(Ctx);
}

export function useConfig(): LocaleConfig {
  return LOCALES[useContext(Ctx)];
}

export function useCopy(): Copy {
  return getCopy(useContext(Ctx));
}
