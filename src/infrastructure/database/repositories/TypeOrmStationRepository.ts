import { ILike, type DataSource, type Repository } from 'typeorm';
import { Station } from '../../../domain/entities/Station';
import { NotFoundError } from '../../../domain/errors/DomainError';
import type {
  CreateStationData,
  Paginated,
  StationListFilters,
  StationRepository,
  UpdateStationData,
} from '../../../domain/repositories/StationRepository';
import { StationSchema } from '../schemas';

/** Relações carregadas sempre que a estação é devolvida sozinha. */
const DETAIL_RELATIONS = {
  parameters: { typeParameter: true },
} as const;

export class TypeOrmStationRepository implements StationRepository {
  private readonly repository: Repository<Station>;

  constructor(dataSource: DataSource) {
    this.repository = dataSource.getRepository(StationSchema);
  }

  async create(data: CreateStationData): Promise<Station> {
    const station = this.repository.create({
      uuid: data.uuid,
      name: data.name,
      latitude: data.latitude,
      longitude: data.longitude,
      dateLastMeasure: null,
      // `cascade: ['insert']` grava estação e parâmetros na mesma transação.
      parameters: data.parameters.map((parameter) => ({
        typeParameterId: parameter.typeParameterId,
      })) as Station['parameters'],
    });

    const saved = await this.repository.save(station);
    return this.findByIdOrFail(saved.id);
  }

  async update(id: string, data: UpdateStationData): Promise<Station> {
    const changes = removeUndefined(data);

    if (Object.keys(changes).length > 0) {
      await this.repository.update({ id }, changes);
    }

    return this.findByIdOrFail(id);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete({ id });
  }

  async findById(id: string): Promise<Station | null> {
    return this.repository.findOne({ where: { id }, relations: DETAIL_RELATIONS });
  }

  async findByUuid(uuid: string): Promise<Station | null> {
    return this.repository.findOne({ where: { uuid }, relations: DETAIL_RELATIONS });
  }

  async list(filters: StationListFilters): Promise<Paginated<Station>> {
    const [items, total] = await this.repository.findAndCount({
      where: filters.name ? { name: ILike(`%${filters.name}%`) } : {},
      order: { name: 'ASC' },
      skip: (filters.page - 1) * filters.perPage,
      take: filters.perPage,
    });

    return { items, total, page: filters.page, perPage: filters.perPage };
  }

  private async findByIdOrFail(id: string): Promise<Station> {
    const station = await this.findById(id);
    if (!station) {
      throw new NotFoundError('Estação', id);
    }
    return station;
  }
}

/** `update` do TypeORM trata `undefined` como "grave NULL"; então tiramos as chaves ausentes. */
function removeUndefined<T extends object>(source: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(source).filter(([, value]) => value !== undefined),
  ) as Partial<T>;
}
