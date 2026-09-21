/**
 * Catálogo de grandezas que uma estação pode medir (temperatura, umidade, ...).
 *
 * É o que torna o modelo dinâmico (RF1): uma estação nova só precisa referenciar
 * os tipos que seus sensores produzem, sem alteração de schema.
 */
export class TypeParameter {
  id!: string;
  /** Chave usada no JSON enviado pela estação, ex.: `temp`, `hum`. */
  typeJson!: string;
  name!: string;
  unit!: string;
  numberOfDecimalCases!: number;
  /** Multiplicador aplicado ao valor bruto do sensor. */
  factor!: number;
  /** Deslocamento somado após o fator. */
  offset!: number;

  /** Converte a leitura bruta do sensor para a unidade final do parâmetro. */
  toReadableValue(rawValue: number): number {
    const converted = rawValue * this.factor + this.offset;
    return Number(converted.toFixed(this.numberOfDecimalCases));
  }
}
