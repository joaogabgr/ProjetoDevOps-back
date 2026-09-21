import type { Station } from '../entities/Station';

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
  findById(id: string): Promise<Station | null>;
  findByUuid(uuid: string): Promise<Station | null>;
  list(filters: StationListFilters): Promise<Paginated<Station>>;
}
