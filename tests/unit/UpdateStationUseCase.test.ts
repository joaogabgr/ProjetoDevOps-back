import { beforeEach, describe, expect, it } from 'vitest';
import { UpdateStationUseCase } from '../../src/application/use-cases/station/UpdateStationUseCase';
import { NotFoundError } from '../../src/domain/errors/DomainError';
import { buildStation, InMemoryStationRepository } from '../fakes/InMemoryStationRepository';

describe('UpdateStationUseCase (SCRUM-15 — RF2: editar estação meteorológica)', () => {
  let repository: InMemoryStationRepository;
  let useCase: UpdateStationUseCase;

  beforeEach(() => {
    repository = new InMemoryStationRepository();
    useCase = new UpdateStationUseCase(repository);
  });

  it('atualiza o nome da estação', async () => {
    const station = buildStation({ name: 'Estação Antiga' });
    await repository.seed([station]);

    const result = await useCase.execute(station.id, { name: 'Estação Renomeada' });

    expect(result.name).toBe('Estação Renomeada');
  });

  it('atualiza latitude e longitude mantendo os demais campos', async () => {
    const station = buildStation({
      uuid: 'estacao-uuid-fixo',
      name: 'Estação Central',
      latitude: '-23.5505',
      longitude: '-46.6333',
    });
    await repository.seed([station]);

    const result = await useCase.execute(station.id, { latitude: '-22.9068', longitude: '-43.1729' });

    expect(result.latitude).toBe('-22.9068');
    expect(result.longitude).toBe('-43.1729');
    // Campos não enviados continuam intactos.
    expect(result.uuid).toBe('estacao-uuid-fixo');
    expect(result.name).toBe('Estação Central');
  });

  it('não altera o uuid da estação, mesmo que não seja aceito no input', async () => {
    const station = buildStation({ uuid: 'uuid-original' });
    await repository.seed([station]);

    const result = await useCase.execute(station.id, { name: 'Novo nome' });

    expect(result.uuid).toBe('uuid-original');
  });

  it('lança NotFoundError quando a estação não existe', async () => {
    await expect(useCase.execute('id-inexistente', { name: 'Qualquer' })).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });

  it('permite atualização parcial de um único campo', async () => {
    const station = buildStation({ name: 'Estação Original', latitude: '-23.5505' });
    await repository.seed([station]);

    const result = await useCase.execute(station.id, { name: 'Estação Modificada' });

    expect(result.name).toBe('Estação Modificada');
    expect(result.latitude).toBe('-23.5505');
  });
});
