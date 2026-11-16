import { beforeEach, describe, expect, it } from 'vitest';
import { CreateUserUseCase } from '../../src/application/use-cases/user/CreateUserUseCase';
import { UpdateUserUseCase } from '../../src/application/use-cases/user/UpdateUserUseCase';
import { UserRole } from '../../src/domain/enums/UserRole';
import { ValidationError } from '../../src/domain/errors/DomainError';
import { FakePasswordHasher } from '../fakes/FakePasswordHasher';
import { buildUser, InMemoryUserRepository } from '../fakes/InMemoryUserRepository';

const base = { name: 'Maria das Dores', email: 'maria@vigia.org', password: 'senha-forte', cpf: '52998224725' };

describe('Perfis e comunidade do usuário (SCRUM-74 — RF5)', () => {
  let repository: InMemoryUserRepository;
  let create: CreateUserUseCase;
  let update: UpdateUserUseCase;

  beforeEach(() => {
    repository = new InMemoryUserRepository();
    create = new CreateUserUseCase(repository, new FakePasswordHasher());
    update = new UpdateUserUseCase(repository);
  });

  it('cadastra um agente comunitário com a sua comunidade', async () => {
    const user = await create.execute({ ...base, role: UserRole.COMMUNITY_AGENT, community: ' São Benedito ' });

    expect(user.role).toBe(UserRole.COMMUNITY_AGENT);
    expect(user.community).toBe('São Benedito');
  });

  it('CA1: recusa agente comunitário sem comunidade, apontando o campo', async () => {
    const attempt = create.execute({ ...base, role: UserRole.COMMUNITY_AGENT });

    await expect(attempt).rejects.toBeInstanceOf(ValidationError);
    await expect(attempt).rejects.toMatchObject({ details: [{ field: 'community' }] });
  });

  it('ignora a comunidade informada para técnico de campo', async () => {
    const user = await create.execute({ ...base, role: UserRole.TECHNICIAN, community: 'São Benedito' });

    expect(user.community).toBeNull();
  });

  it('recusa trocar um técnico para agente sem informar a comunidade', async () => {
    const technician = buildUser({ role: UserRole.TECHNICIAN });
    await repository.seed([technician]);

    await expect(update.execute(technician.id, { role: UserRole.COMMUNITY_AGENT })).rejects.toBeInstanceOf(
      ValidationError,
    );
  });

  it('limpa a comunidade quando o agente vira técnico', async () => {
    const agent = buildUser({ role: UserRole.COMMUNITY_AGENT, community: 'São Benedito' });
    await repository.seed([agent]);

    const updated = await update.execute(agent.id, { role: UserRole.TECHNICIAN });

    expect(updated.community).toBeNull();
  });

  it('troca a comunidade de um agente', async () => {
    const agent = buildUser({ role: UserRole.COMMUNITY_AGENT, community: 'São Benedito' });
    await repository.seed([agent]);

    const updated = await update.execute(agent.id, { community: 'Porto Esperança' });

    expect(updated.community).toBe('Porto Esperança');
  });
});
