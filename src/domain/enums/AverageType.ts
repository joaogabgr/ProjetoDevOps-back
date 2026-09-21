/** Granularidade da média pré-calculada de uma estação (médias horárias e diárias). */
export const AverageType = {
  HOURLY: 'HOURLY',
  DAILY: 'DAILY',
} as const;

export type AverageType = (typeof AverageType)[keyof typeof AverageType];

export const AVERAGE_TYPES = Object.values(AverageType);
