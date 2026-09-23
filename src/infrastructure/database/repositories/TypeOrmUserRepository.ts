import type { DataSource, Repository } from 'typeorm';
import { User } from '../../../domain/entities/User';
import { NotFoundError } from '../../../domain/errors/DomainError';
import type {
  CreateUserData,
  UpdateUserData,
  UserRepository,
} from '../../../domain/repositories/UserRepository';
import { UserSchema } from '../schemas';

export class TypeOrmUserRepository implements UserRepository {
  private readonly repository: Repository<User>;

  constructor(dataSource: DataSource) {
    this.repository = dataSource.getRepository(UserSchema);
  }

  async create(data: CreateUserData): Promise<User> {
    const user = this.repository.create({
      name: data.name,
      email: data.email,
      password: data.passwordHash,
      cpf: data.cpf,
      role: data.role,
      active: true,
    });

    return this.repository.save(user);
  }

  async update(id: string, data: UpdateUserData): Promise<User> {
    const changes = removeUndefined(data);

    if (Object.keys(changes).length > 0) {
      await this.repository.update({ id }, changes);
    }

    const updated = await this.findById(id);
    if (!updated) {
      throw new NotFoundError('Usuário', id);
    }

    return updated;
  }

  async findById(id: string): Promise<User | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.repository.findOne({ where: { email } });
  }

  async findByCpf(cpf: string): Promise<User | null> {
    return this.repository.findOne({ where: { cpf } });
  }
}

/** `update` do TypeORM trata `undefined` como "grave NULL"; então tiramos as chaves ausentes. */
function removeUndefined<T extends object>(source: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(source).filter(([, value]) => value !== undefined),
  ) as Partial<T>;
}
