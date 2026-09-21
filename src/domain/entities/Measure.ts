import type { Alert } from './Alert';
import type { Parameter } from './Parameter';

/** Leitura individual recebida de um sensor da estação (RF6). */
export class Measure {
  id!: string;
  /** Momento da coleta segundo a própria estação, em unix time (ms). */
  unixTime!: number;
  value!: number;
  parameterId!: string;

  parameter?: Parameter;
  alerts?: Alert[];

  get collectedAt(): Date {
    return new Date(this.unixTime);
  }
}
