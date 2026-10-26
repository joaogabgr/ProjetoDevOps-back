import { beforeEach, describe, expect, it } from 'vitest';
import { ListUsersUseCase } from '../../src/application/use-cases/user/ListUsersUseCase';
import { UserRole } from '../../src/domain/enums/UserRole';
import { buildUser, InMemoryUserRepository } from '../fakes/InMemoryUserRepository';

describe('ListUsersUseCase (SCRUM-24 — RF5: listar usuários)', () => {
  let repository: InMemoryUserRepository;
  let useCase: ListUsersUseCase;

  beforeEach(() => {
    repository = new InMemoryUserRepository();
    useCase = new ListUsersUseCase(repository);
  });

  it('retorna lista vazia e total zero quando não há usuários', async () => {
    const result = await useCase.execute({ page: 1, perPage: 20 });

    expect(result.items).toEqual([]);
    expect(result.total).toBe(0);
  });

  it('lista os usuários ordenados por nome', async () => {
    await repository.seed([
      buildUser({ name: 'Carla', email: 'carla@example.com' }),
      buildUser({ name: 'Ana', email: 'ana@example.com' }),
      buildUser({ name: 'Bruno', email: 'bruno@example.com' }),
    ]);

    const result = await useCase.execute({ page: 1, perPage: 20 });

    expect(result.items.map((user) => user.name)).toEqual(['Ana', 'Bruno', 'Carla']);
    expect(result.total).toBe(3);
  });

  it('pagina os resultados respeitando page e perPage', async () => {
    await repository.seed([
      buildUser({ name: 'Ana', email: 'ana@example.com' }),
      buildUser({ name: 'Bruno', email: 'bruno@example.com' }),
      buildUser({ name: 'Carla', email: 'carla@example.com' }),
    ]);

    const secondPage = await useCase.execute({ page: 2, perPage: 2 });

    expect(secondPage.items.map((user) => user.name)).toEqual(['Carla']);
    expect(secondPage.total).toBe(3);
  });

  it('filtra por perfil', async () => {
    await repository.seed([
      buildUser({ name: 'Ana', email: 'ana@example.com', role: UserRole.ADMIN }),
      buildUser({ name: 'Bruno', email: 'bruno@example.com', role: UserRole.EMPLOYEE }),
    ]);

    const result = await useCase.execute({ page: 1, perPage: 20, role: UserRole.ADMIN });

    expect(result.items.map((user) => user.name)).toEqual(['Ana']);
    expect(result.total).toBe(1);
  });

  it('filtra por nome de forma parcial e case-insensitive', async () => {
    await repository.seed([
      buildUser({ name: 'Ana Souza', email: 'ana@example.com' }),
      buildUser({ name: 'Bruno Lima', email: 'bruno@example.com' }),
    ]);

    const result = await useCase.execute({ page: 1, perPage: 20, name: 'souza' });

    expect(result.items.map((user) => user.name)).toEqual(['Ana Souza']);
  });

  it('nunca devolve a senha nem o hash', async () => {
    await repository.seed([buildUser({ password: 'hash-secreto' })]);

    const result = await useCase.execute({ page: 1, perPage: 20 });

    expect(result.items[0]).not.toHaveProperty('password');
    expect(JSON.stringify(result)).not.toContain('hash-secreto');
  });
});
