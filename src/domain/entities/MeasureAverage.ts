import type { AverageType } from '../enums/AverageType';
import type { Station } from './Station';

/**
 * Média pré-calculada de uma estação, para os painéis não varrerem a tabela de
 * medidas a cada consulta (RF7).
 */
export class MeasureAverage {
  id!: string;
  typeAverage!: AverageType;
  /** Nome da grandeza agregada, ex.: `Temperatura`. */
  name!: string;
  value!: number;
  createdAt!: Date;
  stationId!: string;

  station?: Station;
}
