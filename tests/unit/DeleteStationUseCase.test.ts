import { beforeEach, describe, expect, it } from 'vitest';
import { DeleteStationUseCase } from '../../src/application/use-cases/station/DeleteStationUseCase';
import { NotFoundError } from '../../src/domain/errors/DomainError';
import { buildStation, InMemoryStationRepository } from '../fakes/InMemoryStationRepository';

describe('DeleteStationUseCase (SCRUM-17 — RF2: excluir estação meteorológica)', () => {
  let repository: InMemoryStationRepository;
  let useCase: DeleteStationUseCase;

  beforeEach(() => {
    repository = new InMemoryStationRepository();
    useCase = new DeleteStationUseCase(repository);
  });

  it('remove a estação existente', async () => {
    const station = buildStation({ name: 'Estação a Remover' });
    await repository.seed([station]);

    await useCase.execute(station.id);

    expect(await repository.findById(station.id)).toBeNull();
  });

  it('não afeta outras estações ao excluir uma delas', async () => {
    const toRemove = buildStation({ name: 'Estação Removida' });
    const toKeep = buildStation({ name: 'Estação Mantida' });
    await repository.seed([toRemove, toKeep]);

    await useCase.execute(toRemove.id);

    expect(await repository.findById(toKeep.id)).not.toBeNull();
  });

  it('lança NotFoundError quando a estação não existe', async () => {
    await expect(useCase.execute('id-inexistente')).rejects.toBeInstanceOf(NotFoundError);
  });

  it('não remove nada do repositório quando a estação não existe', async () => {
    const station = buildStation({ name: 'Estação Intacta' });
    await repository.seed([station]);

    await expect(useCase.execute('id-inexistente')).rejects.toBeInstanceOf(NotFoundError);
    expect(await repository.findById(station.id)).not.toBeNull();
  });
});
