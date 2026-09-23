import { beforeEach, describe, expect, it } from 'vitest';
import { CreateUserUseCase } from '../../src/application/use-cases/user/CreateUserUseCase';
import { UserRole } from '../../src/domain/enums/UserRole';
import { ConflictError, ValidationError } from '../../src/domain/errors/DomainError';
import { FakePasswordHasher } from '../fakes/FakePasswordHasher';
import { buildUser, InMemoryUserRepository } from '../fakes/InMemoryUserRepository';

describe('CreateUserUseCase (SCRUM-22 — RF5: cadastrar usuário)', () => {
  let repository: InMemoryUserRepository;
  let useCase: CreateUserUseCase;

  beforeEach(() => {
    repository = new InMemoryUserRepository();
    useCase = new CreateUserUseCase(repository, new FakePasswordHasher());
  });

  const validInput = {
    name: 'Ana Souza',
    email: 'ana.souza@tecsus.com',
    password: 'senha-forte-123',
    cpf: '111.444.777-35',
    role: UserRole.ADMIN,
  };

  it('cadastra um usuário com sucesso e devolve o DTO sem a senha', async () => {
    const result = await useCase.execute(validInput);

    expect(result).toMatchObject({
      name: 'Ana Souza',
      email: 'ana.souza@tecsus.com',
      cpf: '11144477735',
      role: UserRole.ADMIN,
      active: true,
    });
    expect(result).not.toHaveProperty('password');
  });

  it('persiste a senha como hash, nunca em texto puro', async () => {
    const result = await useCase.execute(validInput);

    const saved = await repository.findById(result.id);
    expect(saved?.password).not.toBe(validInput.password);
    expect(saved?.password).toBe('hashed:senha-forte-123');
  });

  it('normaliza e-mail para minúsculas e remove espaços', async () => {
    const result = await useCase.execute({ ...validInput, email: '  Ana.Souza@Tecsus.com  ' });

    expect(result.email).toBe('ana.souza@tecsus.com');
  });

  it('normaliza o CPF removendo a máscara antes de persistir', async () => {
    const result = await useCase.execute({ ...validInput, cpf: '111.444.777-35' });

    expect(result.cpf).toBe('11144477735');
  });

  it('rejeita CPF com dígito verificador inválido', async () => {
    await expect(useCase.execute({ ...validInput, cpf: '111.444.777-36' })).rejects.toBeInstanceOf(
      ValidationError,
    );
  });

  it('rejeita cadastro com e-mail já utilizado por outro usuário', async () => {
    await repository.seed([buildUser({ email: 'ana.souza@tecsus.com', cpf: '52998224725' })]);

    await expect(useCase.execute(validInput)).rejects.toBeInstanceOf(ConflictError);
  });

  it('rejeita cadastro com CPF já utilizado por outro usuário', async () => {
    await repository.seed([buildUser({ email: 'outro@tecsus.com', cpf: '11144477735' })]);

    await expect(useCase.execute(validInput)).rejects.toBeInstanceOf(ConflictError);
  });
});
