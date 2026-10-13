"use client";
// O mapa da campanha no país da página: Brasil por padrão, EUA dentro de /us.
// O mapa americano (contornos e projeção Albers) é carregado à parte, para não pesar nas páginas do Brasil.
import dynamic from "next/dynamic";
import { BR_GEO } from "@/lib/geo";
import CountryMap, { type MapProps } from "./CountryMap";
import { useCopy, useLocale } from "./LocaleProvider";

export type { MapCity, MapFocus, MapMarker, MapProps } from "./CountryMap";

const UsMap = dynamic(() => import("./UsMap"));

export default function BrazilMap(props: MapProps) {
  const locale = useLocale();
  const { MAP } = useCopy();
  if (locale === "us") return <UsMap {...props} ariaLabel={MAP.aria} />;
  return <CountryMap geo={BR_GEO} ariaLabel={MAP.aria} {...props} />;
}
