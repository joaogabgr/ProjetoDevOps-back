import { In, type DataSource, type Repository } from 'typeorm';
import { TypeParameter } from '../../../domain/entities/TypeParameter';
import type {
  CreateTypeParameterData,
  TypeParameterRepository,
} from '../../../domain/repositories/TypeParameterRepository';
import { TypeParameterSchema } from '../schemas';

export class TypeOrmTypeParameterRepository implements TypeParameterRepository {
  private readonly repository: Repository<TypeParameter>;

  constructor(dataSource: DataSource) {
    this.repository = dataSource.getRepository(TypeParameterSchema);
  }

  async create(data: CreateTypeParameterData): Promise<TypeParameter> {
    const typeParameter = this.repository.create({ ...data, factor: 1, offset: 0 });
    return this.repository.save(typeParameter);
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
