import type { Paginated, StationRepository } from '../../../domain/repositories/StationRepository';
import { toStationDTO, type StationDTO } from '../../dtos/StationDTO';

export interface ListStationsInput {
  readonly page: number;
  readonly perPage: number;
  readonly name?: string;
}

export class ListStationsUseCase {
  constructor(private readonly stations: StationRepository) {}

  async execute(input: ListStationsInput): Promise<Paginated<StationDTO>> {
    const result = await this.stations.list(input);

    return {
      items: result.items.map(toStationDTO),
      total: result.total,
      page: result.page,
      perPage: result.perPage,
    };
  }
}
