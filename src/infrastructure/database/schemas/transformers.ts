import type { ValueTransformer } from 'typeorm';

/**
 * O driver do Postgres devolve `bigint` como string para não perder precisão.
 * Os valores que usamos aqui (unix time em ms) cabem com folga em `Number.MAX_SAFE_INTEGER`,
 * então convertemos na borda e o domínio trabalha só com `number`.
 */
export const bigintToNumber: ValueTransformer = {
  to: (value: number | null | undefined) => value ?? null,
  from: (value: string | null): number | null => (value === null ? null : Number(value)),
};

/** Mesma conversão, para colunas `bigint` obrigatórias. */
export const requiredBigintToNumber: ValueTransformer = {
  to: (value: number) => value,
  from: (value: string): number => Number(value),
};

/** `numeric` também chega como string; o domínio espera `number`. */
export const numericToNumber: ValueTransformer = {
  to: (value: number) => value,
  from: (value: string): number => Number(value),
};
