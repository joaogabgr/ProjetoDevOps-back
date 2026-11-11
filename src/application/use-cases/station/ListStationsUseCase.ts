import type { Biome } from '../../../domain/enums/Biome';
import type { Paginated, StationRepository } from '../../../domain/repositories/StationRepository';
import { toStationDTO, type StationDTO } from '../../dtos/StationDTO';

export interface ListStationsInput {
  readonly page: number;
  readonly perPage: number;
  readonly name?: string;
  readonly biome?: Biome;
  readonly community?: string;
  readonly status?: 'active' | 'inactive';
}

export class ListStationsUseCase {
  constructor(private readonly stations: StationRepository) {}

  async execute(input: ListStationsInput): Promise<Paginated<StationDTO>> {
    const { status, ...filters } = input;
    const result = await this.stations.list({
      ...filters,
      ...(status ? { active: status === 'active' } : {}),
    });

    return {
      items: result.items.map(toStationDTO),
      total: result.total,
      page: result.page,
      perPage: result.perPage,
    };
  }
}
