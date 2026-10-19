import { beforeEach, describe, expect, it } from 'vitest';
import { CreateTypeParameterUseCase } from '../../src/application/use-cases/type-parameter/CreateTypeParameterUseCase';
import { ConflictError } from '../../src/domain/errors/DomainError';
import {
  buildBoardTypeParameters,
  InMemoryTypeParameterRepository,
} from '../fakes/InMemoryTypeParameterRepository';

describe('CreateTypeParameterUseCase (SCRUM-18 — RF3: cadastrar parâmetro)', () => {
  let repository: InMemoryTypeParameterRepository;
  let useCase: CreateTypeParameterUseCase;

  beforeEach(() => {
    repository = new InMemoryTypeParameterRepository(buildBoardTypeParameters());
    useCase = new CreateTypeParameterUseCase(repository);
  });

  it('cadastra um parâmetro novo com fator 1 e deslocamento 0', async () => {
    const created = await useCase.execute({
      typeJson: 'radiacao',
      name: 'Radiação Solar',
      unit: 'W/m²',
      numberOfDecimalCases: 0,
    });

    expect(created).toEqual({
      id: '8',
      typeJson: 'radiacao',
      name: 'Radiação Solar',
      unit: 'W/m²',
      numberOfDecimalCases: 0,
      factor: 1,
      offset: 0,
    });
    expect(await repository.findByTypeJson('radiacao')).not.toBeNull();
  });

  it('recusa uma chave que já existe', async () => {
    await expect(
      useCase.execute({ typeJson: 'nivel', name: 'Nível 2', unit: 'cm', numberOfDecimalCases: 1 }),
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it('recusa um nome que já existe', async () => {
    await expect(
      useCase.execute({ typeJson: 'nivel2', name: 'Nível do Rio', unit: 'cm', numberOfDecimalCases: 1 }),
    ).rejects.toBeInstanceOf(ConflictError);
  });
});
