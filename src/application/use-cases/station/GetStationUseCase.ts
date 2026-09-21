import { NotFoundError } from '../../../domain/errors/DomainError';
import type { StationRepository } from '../../../domain/repositories/StationRepository';
import { toStationDTO, type StationDTO } from '../../dtos/StationDTO';

export class GetStationUseCase {
  constructor(private readonly stations: StationRepository) {}

  async execute(id: string): Promise<StationDTO> {
    const station = await this.stations.findById(id);
    if (!station) {
      throw new NotFoundError('Estação', id);
    }

    return toStationDTO(station);
  }
}
