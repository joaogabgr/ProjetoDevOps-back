/** Biomas onde a ONG tem estações (RF2). */
export const Biome = {
  PANTANAL: 'PANTANAL',
  CERRADO: 'CERRADO',
  AMAZONIA: 'AMAZONIA',
} as const;

export type Biome = (typeof Biome)[keyof typeof Biome];

export const BIOMES = Object.values(Biome);
