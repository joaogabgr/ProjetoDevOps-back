import { ConflictError, NotFoundError } from '../../../domain/errors/DomainError';
import type { TypeParameterRepository } from '../../../domain/repositories/TypeParameterRepository';

/** Exclui um parâmetro do catálogo (RF3). */
export class DeleteTypeParameterUseCase {
  constructor(private readonly typeParameters: TypeParameterRepository) {}

  async execute(id: string): Promise<void> {
    const typeParameter = await this.typeParameters.findById(id);
    if (!typeParameter) {
      throw new NotFoundError('Parâmetro', id);
    }

    if ((await this.typeParameters.countStationLinks(id)) > 0) {
      throw new ConflictError('Parâmetro instalado em estações não pode ser excluído.');
    }

    await this.typeParameters.delete(id);
  }
}
