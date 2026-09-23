import { beforeEach, describe, expect, it } from 'vitest';
import { UpdateUserUseCase } from '../../src/application/use-cases/user/UpdateUserUseCase';
import { UserRole } from '../../src/domain/enums/UserRole';
import { ConflictError, NotFoundError } from '../../src/domain/errors/DomainError';
import { buildUser, InMemoryUserRepository } from '../fakes/InMemoryUserRepository';

describe('UpdateUserUseCase (SCRUM-23 — RF5: editar usuário)', () => {
  let repository: InMemoryUserRepository;
  let useCase: UpdateUserUseCase;

  beforeEach(() => {
    repository = new InMemoryUserRepository();
    useCase = new UpdateUserUseCase(repository);
  });

  it('atualiza o nome do usuário', async () => {
    const user = buildUser({ name: 'Nome Antigo' });
    await repository.seed([user]);

    const result = await useCase.execute(user.id, { name: 'Nome Novo' });

    expect(result.name).toBe('Nome Novo');
  });

  it('altera a permissão (role) do usuário', async () => {
    const user = buildUser({ role: UserRole.EMPLOYEE });
    await repository.seed([user]);

    const result = await useCase.execute(user.id, { role: UserRole.ADMIN });

    expect(result.role).toBe(UserRole.ADMIN);
  });

  it('desativa e reativa um usuário', async () => {
    const user = buildUser({ active: true });
    await repository.seed([user]);

    const deactivated = await useCase.execute(user.id, { active: false });
    expect(deactivated.active).toBe(false);

    const reactivated = await useCase.execute(user.id, { active: true });
    expect(reactivated.active).toBe(true);
  });

  it('atualiza o e-mail normalizando para minúsculas e sem espaços', async () => {
    const user = buildUser({ email: 'antigo@tecsus.com' });
    await repository.seed([user]);

    const result = await useCase.execute(user.id, { email: '  Novo@Tecsus.com  ' });

    expect(result.email).toBe('novo@tecsus.com');
  });

  it('não altera o cpf, mesmo que não seja aceito no input', async () => {
    const user = buildUser({ cpf: '11144477735' });
    await repository.seed([user]);

    const result = await useCase.execute(user.id, { name: 'Outro Nome' });

    expect(result.cpf).toBe('11144477735');
  });

  it('permite atualização parcial mantendo os demais campos intactos', async () => {
    const user = buildUser({ name: 'Nome Original', role: UserRole.EMPLOYEE, active: true });
    await repository.seed([user]);

    const result = await useCase.execute(user.id, { name: 'Nome Modificado' });

    expect(result.name).toBe('Nome Modificado');
    expect(result.role).toBe(UserRole.EMPLOYEE);
    expect(result.active).toBe(true);
  });

  it('lança NotFoundError quando o usuário não existe', async () => {
    await expect(useCase.execute('id-inexistente', { name: 'Qualquer' })).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });

  it('lança ConflictError ao tentar usar o e-mail de outro usuário', async () => {
    const userA = buildUser({ email: 'usuario.a@tecsus.com' });
    const userB = buildUser({ email: 'usuario.b@tecsus.com' });
    await repository.seed([userA, userB]);

    await expect(
      useCase.execute(userB.id, { email: 'usuario.a@tecsus.com' }),
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it('permite reenviar o próprio e-mail atual sem gerar conflito', async () => {
    const user = buildUser({ email: 'mesmo@tecsus.com' });
    await repository.seed([user]);

    const result = await useCase.execute(user.id, { email: 'mesmo@tecsus.com', name: 'Novo Nome' });

    expect(result.email).toBe('mesmo@tecsus.com');
    expect(result.name).toBe('Novo Nome');
  });
});
