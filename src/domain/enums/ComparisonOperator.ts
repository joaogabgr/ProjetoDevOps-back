/** Operador usado para comparar uma medida com o limite configurado no tipo de alerta. */
export const ComparisonOperator = {
  GREATER_THAN: 'GT',
  GREATER_THAN_OR_EQUAL: 'GTE',
  LESS_THAN: 'LT',
  LESS_THAN_OR_EQUAL: 'LTE',
  EQUAL: 'EQ',
  NOT_EQUAL: 'NEQ',
} as const;

export type ComparisonOperator = (typeof ComparisonOperator)[keyof typeof ComparisonOperator];

export const COMPARISON_OPERATORS = Object.values(ComparisonOperator);

/** Aplica o operador. Mantido no domínio porque é a regra que dispara os alertas (RF8). */
export function compare(value: number, operator: ComparisonOperator, threshold: number): boolean {
  switch (operator) {
    case ComparisonOperator.GREATER_THAN:
      return value > threshold;
    case ComparisonOperator.GREATER_THAN_OR_EQUAL:
      return value >= threshold;
    case ComparisonOperator.LESS_THAN:
      return value < threshold;
    case ComparisonOperator.LESS_THAN_OR_EQUAL:
      return value <= threshold;
    case ComparisonOperator.EQUAL:
      return value === threshold;
    case ComparisonOperator.NOT_EQUAL:
      return value !== threshold;
  }
}
