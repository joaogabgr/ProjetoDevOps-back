import { ILike, type DataSource, type FindOptionsWhere, type Repository } from 'typeorm';
import { User } from '../../../domain/entities/User';
import { UserRole } from '../../../domain/enums/UserRole';
import { NotFoundError } from '../../../domain/errors/DomainError';
import type { Paginated } from '../../../domain/repositories/StationRepository';
import type {
  CreateUserData,
  UpdateUserData,
  UserListFilters,
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
      community: data.community,
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

  async delete(id: string): Promise<void> {
    await this.repository.delete({ id });
  }

  async countActiveAdmins(): Promise<number> {
    return this.repository.count({ where: { role: UserRole.ADMIN, active: true } });
  }

  async findById(id: string): Promise<User | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.repository.findOne({ where: { email } });
  }

  async findByEmailWithPassword(email: string): Promise<User | null> {
    // `password` tem `select: false` no schema: só vem quando pedido explicitamente.
    return this.repository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .getOne();
  }

  async findByCpf(cpf: string): Promise<User | null> {
    return this.repository.findOne({ where: { cpf } });
  }

  async list(filters: UserListFilters): Promise<Paginated<User>> {
    const where: FindOptionsWhere<User> = {};
    if (filters.role) where.role = filters.role;
    if (filters.name) where.name = ILike(`%${filters.name}%`);
    if (filters.community) where.community = filters.community;

    const [items, total] = await this.repository.findAndCount({
      where,
      order: { name: 'ASC' },
      skip: (filters.page - 1) * filters.perPage,
      take: filters.perPage,
    });

    return { items, total, page: filters.page, perPage: filters.perPage };
  }
}

/** `update` do TypeORM trata `undefined` como "grave NULL"; então tiramos as chaves ausentes. */
function removeUndefined<T extends object>(source: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(source).filter(([, value]) => value !== undefined),
  ) as Partial<T>;
}
