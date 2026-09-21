import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { buildStation } from '../fakes/InMemoryStationRepository';
import { buildTestApp } from '../helpers/buildTestApp';

describe('PATCH /api/stations/:id (SCRUM-15 — RF2: editar estação meteorológica)', () => {
  it('atualiza o nome da estação e retorna 200 com os dados atualizados', async () => {
    const { app, stationRepository } = buildTestApp();
    const station = buildStation({ name: 'Estação Antiga' });
    await stationRepository.seed([station]);

    const response = await request(app)
      .patch(`/api/stations/${station.id}`)
      .send({ name: 'Estação Renomeada' });

    expect(response.status).toBe(200);
    expect(response.body.data.id).toBe(station.id);
    expect(response.body.data.name).toBe('Estação Renomeada');
  });

  it('atualiza latitude e longitude preservando o uuid original', async () => {
    const { app, stationRepository } = buildTestApp();
    const station = buildStation({ uuid: 'uuid-fixo', latitude: '-23.5505', longitude: '-46.6333' });
    await stationRepository.seed([station]);

    const response = await request(app)
      .patch(`/api/stations/${station.id}`)
      .send({ latitude: '-22.9068', longitude: '-43.1729' });

    expect(response.status).toBe(200);
    expect(response.body.data.latitude).toBe('-22.9068');
    expect(response.body.data.longitude).toBe('-43.1729');
    expect(response.body.data.uuid).toBe('uuid-fixo');
  });

  it('retorna 404 quando a estação não existe', async () => {
    const { app } = buildTestApp();

    const response = await request(app)
      .patch(`/api/stations/${randomUUID()}`)
      .send({ name: 'Não importa' });

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe('NOT_FOUND');
  });

  it('retorna 422 quando o id não é um uuid válido', async () => {
    const { app } = buildTestApp();

    const response = await request(app).patch('/api/stations/nao-e-um-uuid').send({ name: 'X' });

    expect(response.status).toBe(422);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('retorna 422 quando o corpo da requisição está vazio', async () => {
    const { app, stationRepository } = buildTestApp();
    const station = buildStation();
    await stationRepository.seed([station]);

    const response = await request(app).patch(`/api/stations/${station.id}`).send({});

    expect(response.status).toBe(422);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('retorna 422 quando a latitude está fora do intervalo permitido', async () => {
    const { app, stationRepository } = buildTestApp();
    const station = buildStation();
    await stationRepository.seed([station]);

    const response = await request(app)
      .patch(`/api/stations/${station.id}`)
      .send({ latitude: '999' });

    expect(response.status).toBe(422);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });
});
