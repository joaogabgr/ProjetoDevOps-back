import { ConflictError, NotFoundError } from '../../../domain/errors/DomainError';
import type { TypeParameterRepository } from '../../../domain/repositories/TypeParameterRepository';

/** Exclui um parâmetro sem leituras, desligando-o das estações (RF3 R5). */
export class DeleteTypeParameterUseCase {
  constructor(private readonly typeParameters: TypeParameterRepository) {}

  async execute(id: string): Promise<void> {
    const typeParameter = await this.typeParameters.findById(id);
    if (!typeParameter) {
      throw new NotFoundError('Parâmetro', id);
    }

    if ((await this.typeParameters.countMeasures(id)) > 0) {
      throw new ConflictError('Parâmetro com leituras não pode ser excluído.');
    }

    await this.typeParameters.unlinkFromStations(id);
    await this.typeParameters.delete(id);
  }
}
