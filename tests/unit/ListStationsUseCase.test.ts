import { beforeEach, describe, expect, it } from 'vitest';
import { ListStationsUseCase } from '../../src/application/use-cases/station/ListStationsUseCase';
import { buildStation, InMemoryStationRepository } from '../fakes/InMemoryStationRepository';

describe('ListStationsUseCase (SCRUM-16 — RF2: listar estações cadastradas)', () => {
  let repository: InMemoryStationRepository;
  let useCase: ListStationsUseCase;

  beforeEach(() => {
    repository = new InMemoryStationRepository();
    useCase = new ListStationsUseCase(repository);
  });

  it('retorna lista vazia e total zero quando não há estações cadastradas', async () => {
    const result = await useCase.execute({ page: 1, perPage: 20 });

    expect(result.items).toEqual([]);
    expect(result.total).toBe(0);
  });

  it('lista as estações cadastradas ordenadas por nome', async () => {
    await repository.seed([
      buildStation({ name: 'Estação Zeta' }),
      buildStation({ name: 'Estação Alfa' }),
      buildStation({ name: 'Estação Beta' }),
    ]);

    const result = await useCase.execute({ page: 1, perPage: 20 });

    expect(result.items.map((station) => station.name)).toEqual([
      'Estação Alfa',
      'Estação Beta',
      'Estação Zeta',
    ]);
    expect(result.total).toBe(3);
  });

  it('pagina os resultados respeitando page e perPage', async () => {
    await repository.seed([
      buildStation({ name: 'Estação A' }),
      buildStation({ name: 'Estação B' }),
      buildStation({ name: 'Estação C' }),
    ]);

    const firstPage = await useCase.execute({ page: 1, perPage: 2 });
    const secondPage = await useCase.execute({ page: 2, perPage: 2 });

    expect(firstPage.items.map((s) => s.name)).toEqual(['Estação A', 'Estação B']);
    expect(secondPage.items.map((s) => s.name)).toEqual(['Estação C']);
    expect(firstPage.total).toBe(3);
    expect(secondPage.total).toBe(3);
  });

  it('filtra por nome de forma parcial e case-insensitive', async () => {
    await repository.seed([
      buildStation({ name: 'Estação Serra do Mar' }),
      buildStation({ name: 'Estação Litoral Norte' }),
    ]);

    const result = await useCase.execute({ page: 1, perPage: 20, name: 'serra' });

    expect(result.items).toHaveLength(1);
    expect(result.items[0]?.name).toBe('Estação Serra do Mar');
  });

  it('devolve o DTO sem expor a entidade de domínio diretamente', async () => {
    await repository.seed([buildStation({ name: 'Estação Central', dateLastMeasure: 1_700_000_000_000 })]);

    const result = await useCase.execute({ page: 1, perPage: 20 });
    const [station] = result.items;

    expect(station).toMatchObject({
      name: 'Estação Central',
      dateLastMeasure: 1_700_000_000_000,
    });
    expect(typeof station?.createdAt).toBe('string');
  });
});
