import { ConflictError, NotFoundError } from '../../../domain/errors/DomainError';
import type { StationRepository } from '../../../domain/repositories/StationRepository';

/** Exclui estação sem histórico; a que já tem leituras só pode ser desativada (RF2 R3 e R4). */
export class DeleteStationUseCase {
  constructor(private readonly stations: StationRepository) {}

  async execute(id: string): Promise<void> {
    const station = await this.stations.findById(id);
    if (!station) {
      throw new NotFoundError('Estação', id);
    }

    if ((await this.stations.countMeasures(id)) > 0) {
      throw new ConflictError('Estação com leituras não pode ser excluída. Desative-a.');
    }

    await this.stations.delete(id);
  }
}
