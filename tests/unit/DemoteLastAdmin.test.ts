import { beforeEach, describe, expect, it } from 'vitest';
import { UpdateUserUseCase } from '../../src/application/use-cases/user/UpdateUserUseCase';
import { UserRole } from '../../src/domain/enums/UserRole';
import { ConflictError } from '../../src/domain/errors/DomainError';
import { buildUser, InMemoryUserRepository } from '../fakes/InMemoryUserRepository';

describe('Troca de perfil do último administrador (SCRUM-77 — RF5 R4)', () => {
  let repository: InMemoryUserRepository;
  let useCase: UpdateUserUseCase;

  beforeEach(() => {
    repository = new InMemoryUserRepository();
    useCase = new UpdateUserUseCase(repository);
  });

  it('CA2: recusa mudar o único administrador ativo para técnico', async () => {
    const admin = buildUser({ role: UserRole.ADMIN });
    await repository.seed([admin]);

    await expect(useCase.execute(admin.id, { role: UserRole.TECHNICIAN })).rejects.toThrow(
      new ConflictError('Não é possível remover o último administrador ativo.'),
    );
    expect((await repository.findById(admin.id))?.role).toBe(UserRole.ADMIN);
  });

  it('permite trocar o perfil quando há outro administrador ativo', async () => {
    const admin = buildUser({ role: UserRole.ADMIN, email: 'a@vigia.org' });
    const other = buildUser({ role: UserRole.ADMIN, email: 'b@vigia.org' });
    await repository.seed([admin, other]);

    const updated = await useCase.execute(admin.id, { role: UserRole.TECHNICIAN });

    expect(updated.role).toBe(UserRole.TECHNICIAN);
  });

  it('manter o perfil de administrador não é bloqueado', async () => {
    const admin = buildUser({ role: UserRole.ADMIN, name: 'Nome Antigo' });
    await repository.seed([admin]);

    const updated = await useCase.execute(admin.id, { role: UserRole.ADMIN, name: 'Nome Novo' });

    expect(updated.name).toBe('Nome Novo');
  });
});
