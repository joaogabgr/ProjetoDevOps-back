import { describe, expect, it } from 'vitest';
import { ListTypeParametersUseCase } from '../../src/application/use-cases/type-parameter/ListTypeParametersUseCase';
import {
  buildBoardTypeParameters,
  InMemoryTypeParameterRepository,
} from '../fakes/InMemoryTypeParameterRepository';

describe('ListTypeParametersUseCase (SCRUM-20 — RF3: listar parâmetros)', () => {
  it('retorna lista vazia quando não há parâmetros', async () => {
    const useCase = new ListTypeParametersUseCase(new InMemoryTypeParameterRepository());

    expect(await useCase.execute()).toEqual([]);
  });

  it('lista os 7 parâmetros que as placas enviam, ordenados por nome', async () => {
    const useCase = new ListTypeParametersUseCase(
      new InMemoryTypeParameterRepository(buildBoardTypeParameters()),
    );

    const result = await useCase.execute();

    expect(result.map((tp) => tp.typeJson)).toEqual([
      'vento_dir',
      'chuva',
      'nivel',
      'pressao',
      'temp',
      'umid',
      'vento_vel',
    ]);
  });

  it('devolve chave, nome, unidade e casas decimais de cada parâmetro', async () => {
    const useCase = new ListTypeParametersUseCase(
      new InMemoryTypeParameterRepository(buildBoardTypeParameters()),
    );

    const result = await useCase.execute();

    expect(result.find((tp) => tp.typeJson === 'nivel')).toEqual({
      id: '7',
      typeJson: 'nivel',
      name: 'Nível do Rio',
      unit: 'cm',
      numberOfDecimalCases: 1,
      factor: 1,
      offset: 0,
    });
  });
});
