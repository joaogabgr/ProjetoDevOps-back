import { beforeEach, describe, expect, it } from 'vitest';
import { UpdateUserUseCase } from '../../src/application/use-cases/user/UpdateUserUseCase';
import { UserRole } from '../../src/domain/enums/UserRole';
import { ConflictError } from '../../src/domain/errors/DomainError';
import { buildUser, InMemoryUserRepository } from '../fakes/InMemoryUserRepository';

describe('UpdateUserUseCase (SCRUM-25 — RF5: desativar usuário)', () => {
  let repository: InMemoryUserRepository;
  let useCase: UpdateUserUseCase;

  beforeEach(() => {
    repository = new InMemoryUserRepository();
    useCase = new UpdateUserUseCase(repository);
  });

  it('desativa um usuário comum', async () => {
    const user = buildUser({ role: UserRole.EMPLOYEE });
    await repository.seed([user]);

    const updated = await useCase.execute(user.id, { active: false });

    expect(updated.active).toBe(false);
  });

  it('recusa desativar o último administrador ativo', async () => {
    const admin = buildUser({ role: UserRole.ADMIN });
    await repository.seed([admin]);

    await expect(useCase.execute(admin.id, { active: false })).rejects.toBeInstanceOf(ConflictError);
    expect((await repository.findById(admin.id))?.active).toBe(true);
  });

  it('desativa um administrador quando existe outro ativo', async () => {
    const admin = buildUser({ role: UserRole.ADMIN, email: 'a@example.com' });
    const other = buildUser({ role: UserRole.ADMIN, email: 'b@example.com' });
    await repository.seed([admin, other]);

    const updated = await useCase.execute(admin.id, { active: false });

    expect(updated.active).toBe(false);
  });
});
