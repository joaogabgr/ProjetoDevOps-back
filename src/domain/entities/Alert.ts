import type { Measure } from './Measure';
import type { TypeAlert } from './TypeAlert';

/** Ocorrência: a medida X violou a regra Y (RF8). */
export class Alert {
  id!: string;
  measureId!: string;
  typeAlertId!: string;
  createdAt!: Date;

  measure?: Measure;
  typeAlert?: TypeAlert;
}
