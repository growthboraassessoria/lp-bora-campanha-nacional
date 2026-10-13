// Geografia dos EUA: a mesma projeção Albers USA dos contornos (us-atlas: escala 1300, centro em 487,5 × 305, quadro 975 × 610),
// reduzida para o espaço de 400 de largura do mapa. Alasca e Havaí caem nos quadros do canto inferior esquerdo.
import { geoAlbersUsa } from "d3-geo";
import { US_MAP, US_STATES } from "./us-states";
import type { Geo } from "./types";

const K = US_MAP.width / 975;
const albers = geoAlbersUsa().scale(1300).translate([487.5, 305]);

/** Ponto no espaço do mapa, ou `null` quando a coordenada fica fora dos EUA. */
export function projectUs(lng: number, lat: number): [number, number] | null {
  const p = albers([lng, lat]);
  return p ? [p[0] * K, p[1] * K] : null;
}

export const US_GEO: Geo = { width: US_MAP.width, height: US_MAP.height, states: US_STATES, project: projectUs };
