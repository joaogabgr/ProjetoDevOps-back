import type { PasswordHasher } from '../../src/domain/services/PasswordHasher';

/** Hasher determinístico — evita a dependência (e o custo) do bcrypt real nos testes. */
export class FakePasswordHasher implements PasswordHasher {
  async hash(plainPassword: string): Promise<string> {
    return `hashed:${plainPassword}`;
  }

  async compare(plainPassword: string, passwordHash: string): Promise<boolean> {
    return passwordHash === `hashed:${plainPassword}`;
  }
}
