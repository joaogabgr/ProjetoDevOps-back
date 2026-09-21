import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { buildStation } from '../fakes/InMemoryStationRepository';
import { buildTestApp } from '../helpers/buildTestApp';

describe('GET /api/stations (SCRUM-16 — RF2: listar estações cadastradas)', () => {
  it('retorna 200 com lista vazia quando não há estações', async () => {
    const { app } = buildTestApp();

    const response = await request(app).get('/api/stations');

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual([]);
    expect(response.body.meta).toEqual({ total: 0, page: 1, perPage: 20, totalPages: 0 });
  });

  it('lista as estações cadastradas com metadados de paginação', async () => {
    const { app, stationRepository } = buildTestApp();
    await stationRepository.seed([
      buildStation({ name: 'Estação Sul' }),
      buildStation({ name: 'Estação Norte' }),
    ]);

    const response = await request(app).get('/api/stations');

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(2);
    expect(response.body.data.map((s: { name: string }) => s.name)).toEqual([
      'Estação Norte',
      'Estação Sul',
    ]);
    expect(response.body.meta).toEqual({ total: 2, page: 1, perPage: 20, totalPages: 1 });
  });

  it('respeita paginação via query string e calcula totalPages', async () => {
    const { app, stationRepository } = buildTestApp();
    await stationRepository.seed([
      buildStation({ name: 'Estação A' }),
      buildStation({ name: 'Estação B' }),
      buildStation({ name: 'Estação C' }),
    ]);

    const response = await request(app).get('/api/stations').query({ page: 2, perPage: 2 });

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].name).toBe('Estação C');
    expect(response.body.meta).toEqual({ total: 3, page: 2, perPage: 2, totalPages: 2 });
  });

  it('filtra por nome via query string', async () => {
    const { app, stationRepository } = buildTestApp();
    await stationRepository.seed([
      buildStation({ name: 'Estação Serra do Mar' }),
      buildStation({ name: 'Estação Litoral Norte' }),
    ]);

    const response = await request(app).get('/api/stations').query({ name: 'litoral' });

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].name).toBe('Estação Litoral Norte');
  });

  it('retorna 422 quando a query é inválida', async () => {
    const { app } = buildTestApp();

    const response = await request(app).get('/api/stations').query({ perPage: 1000 });

    expect(response.status).toBe(422);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });
});
