"use client";
// O mapa dos EUA: os 50 estados e DC em projeção Albers, com Alasca e Havaí em quadros.
import { US_GEO } from "@/lib/geo/us";
import CountryMap, { type MapProps } from "./CountryMap";

export default function UsMap(props: MapProps & { ariaLabel: string }) {
  return <CountryMap geo={US_GEO} {...props} />;
}
