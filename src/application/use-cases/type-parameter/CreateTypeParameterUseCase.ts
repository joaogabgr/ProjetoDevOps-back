import { ConflictError } from '../../../domain/errors/DomainError';
import type { TypeParameterRepository } from '../../../domain/repositories/TypeParameterRepository';
import { toTypeParameterDTO, type TypeParameterDTO } from './ListTypeParametersUseCase';

export interface CreateTypeParameterInput {
  readonly typeJson: string;
  readonly name: string;
  readonly unit: string;
  readonly numberOfDecimalCases: number;
}

/** Cadastra um novo tipo de medida, para receber um sensor novo sem mudar código (RF3). */
export class CreateTypeParameterUseCase {
  constructor(private readonly typeParameters: TypeParameterRepository) {}

  async execute(input: CreateTypeParameterInput): Promise<TypeParameterDTO> {
    if (await this.typeParameters.findByTypeJson(input.typeJson)) {
      throw new ConflictError(`Já existe um parâmetro com a chave "${input.typeJson}".`);
    }
    if (await this.typeParameters.findByName(input.name)) {
      throw new ConflictError(`Já existe um parâmetro com o nome "${input.name}".`);
    }

    const created = await this.typeParameters.create(input);
    return toTypeParameterDTO(created);
  }
}
