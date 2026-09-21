import type { TypeParameter } from '../../../domain/entities/TypeParameter';
import type { TypeParameterRepository } from '../../../domain/repositories/TypeParameterRepository';

export interface TypeParameterDTO {
  id: string;
  typeJson: string;
  name: string;
  unit: string;
  numberOfDecimalCases: number;
  factor: number;
  offset: number;
}

/** Lista o catálogo de grandezas disponíveis para montar uma estação (RF3). */
export class ListTypeParametersUseCase {
  constructor(private readonly typeParameters: TypeParameterRepository) {}

  async execute(): Promise<TypeParameterDTO[]> {
    const items = await this.typeParameters.findAll();
    return items.map(toTypeParameterDTO);
  }
}

function toTypeParameterDTO(typeParameter: TypeParameter): TypeParameterDTO {
  return {
    id: typeParameter.id,
    typeJson: typeParameter.typeJson,
    name: typeParameter.name,
    unit: typeParameter.unit,
    numberOfDecimalCases: typeParameter.numberOfDecimalCases,
    factor: typeParameter.factor,
    offset: typeParameter.offset,
  };
}
