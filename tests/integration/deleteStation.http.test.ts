import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { buildStation } from '../fakes/InMemoryStationRepository';
import { buildTestApp } from '../helpers/buildTestApp';

describe('DELETE /api/stations/:id (SCRUM-17 — RF2: excluir estação meteorológica)', () => {
  it('remove a estação e retorna 204 sem corpo', async () => {
    const { app, stationRepository } = buildTestApp();
    const station = buildStation({ name: 'Estação a Remover' });
    await stationRepository.seed([station]);

    const response = await request(app).delete(`/api/stations/${station.id}`);

    expect(response.status).toBe(204);
    expect(response.body).toEqual({});
  });

  it('a estação removida deixa de aparecer na listagem e na consulta por id', async () => {
    const { app, stationRepository } = buildTestApp();
    const station = buildStation({ name: 'Estação a Remover' });
    await stationRepository.seed([station]);

    await request(app).delete(`/api/stations/${station.id}`).expect(204);

    const getResponse = await request(app).get(`/api/stations/${station.id}`);
    expect(getResponse.status).toBe(404);

    const listResponse = await request(app).get('/api/stations');
    expect(listResponse.body.data).toEqual([]);
  });

  it('retorna 404 quando a estação não existe', async () => {
    const { app } = buildTestApp();

    const response = await request(app).delete(`/api/stations/${randomUUID()}`);

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe('NOT_FOUND');
  });

  it('retorna 422 quando o id não é um uuid válido', async () => {
    const { app } = buildTestApp();

    const response = await request(app).delete('/api/stations/nao-e-um-uuid');

    expect(response.status).toBe(422);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('é idempotente na ausência: excluir duas vezes a mesma estação resulta em 404 na segunda', async () => {
    const { app, stationRepository } = buildTestApp();
    const station = buildStation();
    await stationRepository.seed([station]);

    await request(app).delete(`/api/stations/${station.id}`).expect(204);
    const secondAttempt = await request(app).delete(`/api/stations/${station.id}`);

    expect(secondAttempt.status).toBe(404);
  });
});
