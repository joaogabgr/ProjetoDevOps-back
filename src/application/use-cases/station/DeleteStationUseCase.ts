import { NotFoundError } from '../../../domain/errors/DomainError';
import type { StationRepository } from '../../../domain/repositories/StationRepository';

export class DeleteStationUseCase {
  constructor(private readonly stations: StationRepository) {}

  async execute(id: string): Promise<void> {
    const station = await this.stations.findById(id);
    if (!station) {
      throw new NotFoundError('Estação', id);
    }

    await this.stations.delete(id);
  }
}
