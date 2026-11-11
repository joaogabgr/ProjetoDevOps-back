import type { Station } from '../entities/Station';
import type { Biome } from '../enums/Biome';

export interface StationListFilters {
  readonly page: number;
  readonly perPage: number;
  /** Busca parcial por nome, case-insensitive. */
  readonly name?: string;
}

export interface Paginated<T> {
  readonly items: T[];
  readonly total: number;
  readonly page: number;
  readonly perPage: number;
}

/** Dados de um sensor a ser vinculado à estação. */
export interface StationParameterInput {
  readonly typeParameterId: string;
}

export interface CreateStationData {
  readonly uuid: string;
  readonly name: string;
  readonly latitude: string;
  readonly longitude: string;
  readonly biome: Biome;
  readonly community: string;
  readonly timezone: string;
  readonly communicationTimeoutMinutes: number;
  readonly parameters: ReadonlyArray<StationParameterInput>;
}

export interface UpdateStationData {
  readonly name?: string;
  readonly latitude?: string;
  readonly longitude?: string;
}

/**
 * Porta de persistência de estações.
 *
 * Declarada no domínio e implementada na infraestrutura: é a inversão de dependência
 * que mantém os casos de uso livres de TypeORM.
 */
export interface StationRepository {
  create(data: CreateStationData): Promise<Station>;
  update(id: string, data: UpdateStationData): Promise<Station>;
  delete(id: string): Promise<void>;
  setActive(id: string, active: boolean): Promise<Station>;
  /** Quantas leituras a estação já recebeu, somando todos os sensores. */
  countMeasures(id: string): Promise<number>;
  findById(id: string): Promise<Station | null>;
  findByUuid(uuid: string): Promise<Station | null>;
  /** Comunidades distintas, em ordem alfabética (RF2 R3). */
  listCommunities(): Promise<string[]>;
  list(filters: StationListFilters): Promise<Paginated<Station>>;
}
