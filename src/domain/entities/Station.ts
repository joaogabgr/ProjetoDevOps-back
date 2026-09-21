import type { EmailStation } from './EmailStation';
import type { MeasureAverage } from './MeasureAverage';
import type { Parameter } from './Parameter';

/** Estação meteorológica cadastrada na plataforma (RF1/RF2). */
export class Station {
  id!: string;
  /** Identificador enviado pelo hardware da estação; é por ele que as leituras chegam. */
  uuid!: string;
  name!: string;
  latitude!: string;
  longitude!: string;
  createdAt!: Date;
  /** Unix time (ms) da última leitura recebida. Nulo enquanto a estação nunca reportou. */
  dateLastMeasure!: number | null;

  parameters?: Parameter[];
  emails?: EmailStation[];
  measureAverages?: MeasureAverage[];

  /** Uma estação é considerada inativa quando não reporta há mais tempo que o limite. */
  isStale(maxSilenceMs: number, now: Date = new Date()): boolean {
    if (this.dateLastMeasure === null) return true;
    return now.getTime() - this.dateLastMeasure > maxSilenceMs;
  }
}
