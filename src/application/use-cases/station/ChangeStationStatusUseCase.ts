import { NotFoundError } from '../../../domain/errors/DomainError';
import type { StationRepository } from '../../../domain/repositories/StationRepository';
import { toStationDTO, type StationDTO } from '../../dtos/StationDTO';

/**
 * Desativa ou reativa a estação (RF2 R4).
 *
 * A desativada mantém o histórico; recusar novas leituras dela é regra da recepção (RF6).
 */
export class ChangeStationStatusUseCase {
  constructor(private readonly stations: StationRepository) {}

  async execute(id: string, active: boolean): Promise<StationDTO> {
    const station = await this.stations.findById(id);
    if (!station) {
      throw new NotFoundError('Estação', id);
    }

    return toStationDTO(await this.stations.setActive(id, active));
  }
}
