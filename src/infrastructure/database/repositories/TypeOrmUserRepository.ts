import type { DataSource, Repository } from 'typeorm';
import { User } from '../../../domain/entities/User';
import type { CreateUserData, UserRepository } from '../../../domain/repositories/UserRepository';
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
