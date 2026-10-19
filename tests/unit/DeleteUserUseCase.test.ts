import { beforeEach, describe, expect, it } from 'vitest';
import { DeleteUserUseCase } from '../../src/application/use-cases/user/DeleteUserUseCase';
import { NotFoundError } from '../../src/domain/errors/DomainError';
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

  it('lança NotFoundError quando o usuário não existe', async () => {
    await expect(useCase.execute('00000000-0000-4000-8000-000000000000')).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });
});
