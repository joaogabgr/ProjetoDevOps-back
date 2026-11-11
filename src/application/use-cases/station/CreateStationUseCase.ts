import { ConflictError, ValidationError } from '../../../domain/errors/DomainError';
import type { Biome } from '../../../domain/enums/Biome';
import type { StationRepository } from '../../../domain/repositories/StationRepository';
import type { TypeParameterRepository } from '../../../domain/repositories/TypeParameterRepository';
import { toStationDTO, type StationDTO } from '../../dtos/StationDTO';

export interface CreateStationInput {
  readonly uuid: string;
  readonly name: string;
  readonly latitude: string;
  readonly longitude: string;
  readonly biome: Biome;
  readonly community: string;
  readonly timezone: string;
  readonly communicationTimeoutMinutes: number;
  /** Tipos de grandeza que os sensores desta estação produzem (RF1). */
  readonly typeParameterIds: ReadonlyArray<string>;
}

/** Cadastra uma estação junto com os sensores que ela expõe (RF1/RF2). */
export class CreateStationUseCase {
  constructor(
    private readonly stations: StationRepository,
    private readonly typeParameters: TypeParameterRepository,
  ) {}

  async execute(input: CreateStationInput): Promise<StationDTO> {
    const alreadyRegistered = await this.stations.findByUuid(input.uuid);
    if (alreadyRegistered) {
      throw new ConflictError('Já existe uma estação com este identificador.', [
        { field: 'uuid', message: 'Já existe uma estação com este identificador.' },
      ]);
    }

    await this.assertTypeParametersExist(input.typeParameterIds);

    const station = await this.stations.create({
      uuid: input.uuid,
      name: input.name,
      latitude: input.latitude,
      longitude: input.longitude,
      biome: input.biome,
      community: input.community,
      timezone: input.timezone,
      communicationTimeoutMinutes: input.communicationTimeoutMinutes,
      parameters: input.typeParameterIds.map((typeParameterId) => ({ typeParameterId })),
    });

    return toStationDTO(station);
  }

  private async assertTypeParametersExist(ids: ReadonlyArray<string>): Promise<void> {
    const unique = [...new Set(ids)];
    if (unique.length !== ids.length) {
      throw new ValidationError('Há tipos de parâmetro repetidos para a mesma estação.');
    }

    const found = await this.typeParameters.findExistingIds(unique);
    const missing = unique.filter((id) => !found.includes(id));

    if (missing.length > 0) {
      throw new ValidationError('Tipos de parâmetro inexistentes.', [
        { field: 'typeParameterIds', message: `Não encontrados: ${missing.join(', ')}.` },
      ]);
    }
  }
}
