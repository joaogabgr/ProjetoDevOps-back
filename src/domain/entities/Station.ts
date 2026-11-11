import type { Biome } from '../enums/Biome';
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
  biome!: Biome;
  /** Comunidade atendida, ex.: São Benedito. Define o que o agente comunitário vê (RF9). */
  community!: string;
  /** Fuso IANA da estação, usado para exibir horários (RF7). */
  timezone!: string;
  /** Minutos sem leitura até a estação ficar "sem comunicação" (RF10). */
  communicationTimeoutMinutes!: number;
  /** Desativada mantém o histórico e passa a recusar leituras (RF2 R4). */
  active!: boolean;
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
