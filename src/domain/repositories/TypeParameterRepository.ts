import type { TypeParameter } from '../entities/TypeParameter';

export interface TypeParameterRepository {
  findAll(): Promise<TypeParameter[]>;
  findById(id: string): Promise<TypeParameter | null>;
  /** Usado para validar, de uma vez, todos os tipos informados no cadastro de estação. */
  findExistingIds(ids: ReadonlyArray<string>): Promise<string[]>;
}
