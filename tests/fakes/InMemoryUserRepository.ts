import { randomUUID } from 'node:crypto';
import { User } from '../../src/domain/entities/User';
import { UserRole } from '../../src/domain/enums/UserRole';
import type { CreateUserData, UserRepository } from '../../src/domain/repositories/UserRepository';

/** Implementação em memória da porta `UserRepository`, usada só em teste. */
export class InMemoryUserRepository implements UserRepository {
  private readonly users = new Map<string, User>();

  async seed(users: User[]): Promise<void> {
    for (const user of users) {
      this.users.set(user.id, user);
    }
  }

  async create(data: CreateUserData): Promise<User> {
    const user = new User();
    user.id = randomUUID();
    user.name = data.name;
    user.email = data.email;
    user.password = data.passwordHash;
    user.cpf = data.cpf;
    user.role = data.role;
    user.createdAt = new Date();
    user.active = true;

    this.users.set(user.id, user);
    return user;
  }

  async findById(id: string): Promise<User | null> {
    return this.users.get(id) ?? null;
  }

  async findByEmail(email: string): Promise<User | null> {
    return [...this.users.values()].find((user) => user.email === email) ?? null;
  }

  async findByCpf(cpf: string): Promise<User | null> {
    return [...this.users.values()].find((user) => user.cpf === cpf) ?? null;
  }
}

export function buildUser(overrides: Partial<User> = {}): User {
  const user = new User();
  user.id = overrides.id ?? randomUUID();
  user.name = overrides.name ?? 'Usuário de Teste';
  user.email = overrides.email ?? 'usuario@example.com';
  user.password = overrides.password ?? 'hash-fake';
  user.role = overrides.role ?? UserRole.EMPLOYEE;
  user.cpf = overrides.cpf ?? '11144477735';
  user.createdAt = overrides.createdAt ?? new Date('2026-01-01T00:00:00.000Z');
  user.active = overrides.active ?? true;
  return user;
}
