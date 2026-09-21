import { compare, type ComparisonOperator } from '../enums/ComparisonOperator';
import type { Alert } from './Alert';
import type { Measure } from './Measure';
import type { Parameter } from './Parameter';

/** Regra que define quando uma medida de um parâmetro vira alerta (RF4/RF8). */
export class TypeAlert {
  id!: string;
  name!: string;
  /** Limite comparado com o valor da medida. */
  value!: number;
  comparisonOperator!: ComparisonOperator;
  parameterId!: string;

  parameter?: Parameter;
  alerts?: Alert[];

  /** Regra de negócio do RF8: a medida viola este tipo de alerta? */
  isTriggeredBy(measure: Pick<Measure, 'value'>): boolean {
    return compare(measure.value, this.comparisonOperator, this.value);
  }
}
