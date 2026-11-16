import { ConflictError, NotFoundError } from '../../../domain/errors/DomainError';
import type { TypeParameterRepository } from '../../../domain/repositories/TypeParameterRepository';
import { toTypeParameterDTO, type TypeParameterDTO } from './ListTypeParametersUseCase';

export interface UpdateTypeParameterInput {
  readonly name?: string;
  readonly unit?: string;
  readonly numberOfDecimalCases?: number;
}

/**
 * Edita nome, unidade e casas decimais de um parâmetro (RF3).
 *
 * Mudar a unidade ou as casas muda só a exibição: os valores gravados não são convertidos (R4).
 * A chave não entra aqui porque está gravada nas placas (R3).
 */
export class UpdateTypeParameterUseCase {
  constructor(private readonly typeParameters: TypeParameterRepository) {}

  async execute(id: string, input: UpdateTypeParameterInput): Promise<TypeParameterDTO> {
    const current = await this.typeParameters.findById(id);
    if (!current) {
      throw new NotFoundError('Parâmetro', id);
    }

    if (input.name && input.name !== current.name) {
      const sameName = await this.typeParameters.findByName(input.name);
      if (sameName) {
        throw new ConflictError(`Já existe um parâmetro com o nome "${input.name}".`, [
          { field: 'name', message: 'Já existe um parâmetro com este nome.' },
        ]);
      }
    }

    const updated = await this.typeParameters.update(id, input);
    return toTypeParameterDTO(updated);
  }
}
