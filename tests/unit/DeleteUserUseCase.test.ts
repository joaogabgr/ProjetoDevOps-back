import { beforeEach, describe, expect, it } from 'vitest';
import { DeleteUserUseCase } from '../../src/application/use-cases/user/DeleteUserUseCase';
import { UserRole } from '../../src/domain/enums/UserRole';
import { ConflictError, NotFoundError } from '../../src/domain/errors/DomainError';
import { buildUser, InMemoryUserRepository } from '../fakes/InMemoryUserRepository';

describe('DeleteUserUseCase (SCRUM-25 — RF5: excluir usuário)', () => {
  let repository: InMemoryUserRepository;
  let useCase: DeleteUserUseCase;

  beforeEach(() => {
    repository = new InMemoryUserRepository();
    useCase = new DeleteUserUseCase(repository);
  });

  it('exclui um usuário existente', async () => {
    const user = buildUser();
    await repository.seed([user]);

    await useCase.execute(user.id);

    expect(await repository.findById(user.id)).toBeNull();
  });

  it('recusa excluir o último administrador ativo', async () => {
    const admin = buildUser({ role: UserRole.ADMIN });
    await repository.seed([admin]);

    await expect(useCase.execute(admin.id)).rejects.toBeInstanceOf(ConflictError);
    expect(await repository.findById(admin.id)).not.toBeNull();
  });

  it('exclui um administrador quando existe outro ativo', async () => {
    const admin = buildUser({ role: UserRole.ADMIN, email: 'a@example.com' });
    const other = buildUser({ role: UserRole.ADMIN, email: 'b@example.com' });
    await repository.seed([admin, other]);

    await useCase.execute(admin.id);

    expect(await repository.findById(admin.id)).toBeNull();
  });

  it('exclui um administrador já desativado mesmo sendo o único', async () => {
    const inactive = buildUser({ role: UserRole.ADMIN, active: false, email: 'a@example.com' });
    const admin = buildUser({ role: UserRole.ADMIN, email: 'b@example.com' });
    await repository.seed([inactive, admin]);

    await useCase.execute(inactive.id);

    expect(await repository.findById(inactive.id)).toBeNull();
  });

  it('lança NotFoundError quando o usuário não existe', async () => {
    await expect(useCase.execute('00000000-0000-4000-8000-000000000000')).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });
});
