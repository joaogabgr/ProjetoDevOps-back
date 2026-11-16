import { In, type DataSource, type Repository } from 'typeorm';
import { TypeParameter } from '../../../domain/entities/TypeParameter';
import { NotFoundError } from '../../../domain/errors/DomainError';
import type {
  CreateTypeParameterData,
  TypeParameterRepository,
  UpdateTypeParameterData,
} from '../../../domain/repositories/TypeParameterRepository';
import type { Measure } from '../../../domain/entities/Measure';
import type { Parameter } from '../../../domain/entities/Parameter';
import { MeasureSchema, ParameterSchema, TypeParameterSchema } from '../schemas';

export class TypeOrmTypeParameterRepository implements TypeParameterRepository {
  private readonly repository: Repository<TypeParameter>;
  private readonly stationParameters: Repository<Parameter>;
  private readonly measures: Repository<Measure>;

  constructor(dataSource: DataSource) {
    this.repository = dataSource.getRepository(TypeParameterSchema);
    this.stationParameters = dataSource.getRepository(ParameterSchema);
    this.measures = dataSource.getRepository(MeasureSchema);
  }

  async create(data: CreateTypeParameterData): Promise<TypeParameter> {
    const typeParameter = this.repository.create({ ...data, factor: 1, offset: 0 });
    return this.repository.save(typeParameter);
  }

  async update(id: string, data: UpdateTypeParameterData): Promise<TypeParameter> {
    const changes = Object.fromEntries(Object.entries(data).filter(([, value]) => value !== undefined));
    if (Object.keys(changes).length > 0) {
      await this.repository.update({ id }, changes);
    }

    const updated = await this.findById(id);
    if (!updated) {
      throw new NotFoundError('Parâmetro', id);
    }
    return updated;
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete({ id });
  }

  async countStationLinks(id: string): Promise<number> {
    return this.stationParameters.count({ where: { typeParameterId: id } });
  }

  async countMeasures(id: string): Promise<number> {
    return this.measures.count({ where: { parameter: { typeParameterId: id } } });
  }

  async unlinkFromStations(id: string): Promise<void> {
    await this.stationParameters.delete({ typeParameterId: id });
  }

  async findByTypeJson(typeJson: string): Promise<TypeParameter | null> {
    return this.repository.findOne({ where: { typeJson } });
  }

  async findByName(name: string): Promise<TypeParameter | null> {
    return this.repository.findOne({ where: { name } });
  }

  async findAll(): Promise<TypeParameter[]> {
    return this.repository.find({ order: { name: 'ASC' } });
  }

  async findById(id: string): Promise<TypeParameter | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findExistingIds(ids: ReadonlyArray<string>): Promise<string[]> {
    if (ids.length === 0) return [];

    const found = await this.repository.find({
      where: { id: In([...ids]) },
      select: { id: true },
    });

    // O driver devolve `bigint` como string; normalizamos para comparar com a entrada.
    return found.map((typeParameter) => String(typeParameter.id));
  }
}
