// Cidades mais citadas nas redes da BORA. Fonte: post do Yan Rodrigues (set/2026) perguntando onde as pessoas querem a BORA.
// É sinal de interesse, não cadastro: aparece com selo próprio e nunca entra na contagem.
export type Signal = { slug: string; city: string; uf: string; lat: number; lng: number };
export const SOCIAL_SIGNALS: Signal[] = [
  { slug: "ce-fortaleza", city: "Fortaleza", uf: "CE", lat: -3.73, lng: -38.52 },
  { slug: "go-goiania", city: "Goiânia", uf: "GO", lat: -16.68, lng: -49.25 },
  { slug: "am-manaus", city: "Manaus", uf: "AM", lat: -3.1, lng: -60.02 },
];
