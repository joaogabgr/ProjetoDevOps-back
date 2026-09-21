import { randomUUID } from 'node:crypto';
import { Station } from '../../src/domain/entities/Station';
import { NotFoundError } from '../../src/domain/errors/DomainError';
import type {
  CreateStationData,
  Paginated,
  StationListFilters,
  StationRepository,
  UpdateStationData,
} from '../../src/domain/repositories/StationRepository';

/**
 * Implementação em memória da porta `StationRepository`, usada só em teste.
 *
 * Existe porque o caso de uso depende da interface do domínio, não do TypeORM —
 * a mesma inversão de dependência que permite trocar de ORM permite testar sem banco.
 */
export class InMemoryStationRepository implements StationRepository {
  private readonly stations = new Map<string, Station>();

  async seed(stations: Station[]): Promise<void> {
    for (const station of stations) {
      this.stations.set(station.id, station);
    }
  }

  async create(data: CreateStationData): Promise<Station> {
    const station = new Station();
    station.id = randomUUID();
    station.uuid = data.uuid;
    station.name = data.name;
    station.latitude = data.latitude;
    station.longitude = data.longitude;
    station.createdAt = new Date();
    station.dateLastMeasure = null;
    station.parameters = data.parameters.map((parameter) => ({
      id: randomUUID(),
      stationId: station.id,
      typeParameterId: parameter.typeParameterId,
    })) as Station['parameters'];

    this.stations.set(station.id, station);
    return station;
  }

  async update(id: string, data: UpdateStationData): Promise<Station> {
    const station = this.stations.get(id);
    if (!station) {
      throw new NotFoundError('Estação', id);
    }

    Object.assign(station, data);
    return station;
  }

  async delete(id: string): Promise<void> {
    this.stations.delete(id);
  }

  async findById(id: string): Promise<Station | null> {
    return this.stations.get(id) ?? null;
  }

  async findByUuid(uuid: string): Promise<Station | null> {
    return [...this.stations.values()].find((station) => station.uuid === uuid) ?? null;
  }

  async list(filters: StationListFilters): Promise<Paginated<Station>> {
    const nameFilter = filters.name?.toLowerCase();

    const filtered = [...this.stations.values()]
      .filter((station) => !nameFilter || station.name.toLowerCase().includes(nameFilter))
      .sort((a, b) => a.name.localeCompare(b.name));

    const start = (filters.page - 1) * filters.perPage;
    const items = filtered.slice(start, start + filters.perPage);

    return { items, total: filtered.length, page: filters.page, perPage: filters.perPage };
  }
}

export function buildStation(overrides: Partial<Station> = {}): Station {
  const station = new Station();
  station.id = overrides.id ?? randomUUID();
  station.uuid = overrides.uuid ?? randomUUID();
  station.name = overrides.name ?? 'Estação de Teste';
  station.latitude = overrides.latitude ?? '-23.5505';
  station.longitude = overrides.longitude ?? '-46.6333';
  station.createdAt = overrides.createdAt ?? new Date('2026-01-01T00:00:00.000Z');
  station.dateLastMeasure = overrides.dateLastMeasure ?? null;
  station.parameters = overrides.parameters;
  return station;
}
