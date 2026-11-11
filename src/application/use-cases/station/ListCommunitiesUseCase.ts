import type { StationRepository } from '../../../domain/repositories/StationRepository';

/**
 * Comunidades já usadas nas estações, para o cadastro sugerir e a mesma comunidade
 * não ser escrita de dois jeitos (RF2 R3).
 */
export class ListCommunitiesUseCase {
  constructor(private readonly stations: StationRepository) {}

  async execute(): Promise<string[]> {
    return this.stations.listCommunities();
  }
}
