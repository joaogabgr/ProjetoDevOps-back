import { NotFoundError } from '../../../domain/errors/DomainError';
import type { StationRepository } from '../../../domain/repositories/StationRepository';
import { toStationDTO, type StationDTO } from '../../dtos/StationDTO';

export interface UpdateStationInput {
  readonly name?: string;
  readonly latitude?: string;
  readonly longitude?: string;
}

/**
 * Atualiza os dados cadastrais da estação (RF2).
 *
 * O `uuid` não é editável de propósito: é a chave com que o hardware se identifica,
 * e trocá-lo desligaria as leituras já recebidas do cadastro.
 */
export class UpdateStationUseCase {
  constructor(private readonly stations: StationRepository) {}

  async execute(id: string, input: UpdateStationInput): Promise<StationDTO> {
    const station = await this.stations.findById(id);
    if (!station) {
      throw new NotFoundError('Estação', id);
    }

    const updated = await this.stations.update(id, input);
    return toStationDTO(updated);
  }
}
