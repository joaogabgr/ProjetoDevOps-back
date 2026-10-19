import type { TypeParameter } from '../entities/TypeParameter';

export interface CreateTypeParameterData {
  /** Chave enviada pelas placas no JSON do MQTT, ex.: `nivel`. */
  readonly typeJson: string;
  readonly name: string;
  readonly unit: string;
  readonly numberOfDecimalCases: number;
}

export interface TypeParameterRepository {
  create(data: CreateTypeParameterData): Promise<TypeParameter>;
  findAll(): Promise<TypeParameter[]>;
  findById(id: string): Promise<TypeParameter | null>;
  findByTypeJson(typeJson: string): Promise<TypeParameter | null>;
  findByName(name: string): Promise<TypeParameter | null>;
  /** Usado para validar, de uma vez, todos os tipos informados no cadastro de estação. */
  findExistingIds(ids: ReadonlyArray<string>): Promise<string[]>;
}
