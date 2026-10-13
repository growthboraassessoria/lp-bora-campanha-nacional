// O que o mapa precisa saber de um país: o tamanho do espaço do desenho, os contornos dos estados e a projeção.
import type { StateShape } from "./states";

export type Geo = {
  width: number;
  height: number;
  states: StateShape[];
  /** De longitude e latitude para o espaço do desenho; `null` se o ponto fica fora do país. */
  project: (lng: number, lat: number) => [number, number] | null;
};
