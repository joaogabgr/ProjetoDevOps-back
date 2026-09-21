import type { TypeParameter } from '../../src/domain/entities/TypeParameter';
import type { TypeParameterRepository } from '../../src/domain/repositories/TypeParameterRepository';

/** Fake mínimo — só existe para satisfazer o container nos testes de HTTP. */
export class InMemoryTypeParameterRepository implements TypeParameterRepository {
  constructor(private readonly typeParameters: TypeParameter[] = []) {}

  async findAll(): Promise<TypeParameter[]> {
    return this.typeParameters;
  }

  async findById(id: string): Promise<TypeParameter | null> {
    return this.typeParameters.find((tp) => String(tp.id) === id) ?? null;
  }

  async findExistingIds(ids: ReadonlyArray<string>): Promise<string[]> {
    const existing = new Set(this.typeParameters.map((tp) => String(tp.id)));
    return ids.filter((id) => existing.has(id));
  }
}
