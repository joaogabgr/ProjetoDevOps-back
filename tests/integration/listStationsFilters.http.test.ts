import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { Biome } from '../../src/domain/enums/Biome';
import { buildStation } from '../fakes/InMemoryStationRepository';
import { asAdmin, buildTestApp } from '../helpers/buildTestApp';

async function setup() {
  const { app, stationRepository } = buildTestApp();
  const pantanal = ['F', 'B', 'D', 'A', 'E', 'C'].map((letter) =>
    buildStation({ name: `Pantanal ${letter}`, biome: Biome.PANTANAL, community: 'São Benedito' }),
  );
  const cerrado = ['E', 'A', 'D', 'B', 'C'].map((letter) =>
    buildStation({ name: `Cerrado ${letter}`, biome: Biome.CERRADO, community: 'Vila Goiás', active: letter !== 'E' }),
  );
  await stationRepository.seed([...pantanal, ...cerrado]);
  return app;
}

describe('GET /api/stations com filtros (SCRUM-60 — RF2 R2)', () => {
  it('CA4: filtra por bioma e mantém a ordem por nome', async () => {
    const app = await setup();

    const response = await request(app).get('/api/stations').query({ biome: 'CERRADO' }).set(asAdmin);

    expect(response.status).toBe(200);
    expect(response.body.data.map((s: { name: string }) => s.name)).toEqual([
      'Cerrado A',
      'Cerrado B',
      'Cerrado C',
      'Cerrado D',
      'Cerrado E',
    ]);
    expect(response.body.meta.total).toBe(5);
  });

  it('filtra por comunidade', async () => {
    const app = await setup();

    const response = await request(app).get('/api/stations').query({ community: 'São Benedito' }).set(asAdmin);

    expect(response.body.meta.total).toBe(6);
  });

  it('filtra por status', async () => {
    const app = await setup();

    const inactive = await request(app).get('/api/stations').query({ status: 'inactive' }).set(asAdmin);
    const active = await request(app).get('/api/stations').query({ status: 'active', biome: 'CERRADO' }).set(asAdmin);

    expect(inactive.body.data.map((s: { name: string }) => s.name)).toEqual(['Cerrado E']);
    expect(active.body.meta.total).toBe(4);
  });

  it('recusa status desconhecido', async () => {
    const app = await setup();

    const response = await request(app).get('/api/stations').query({ status: 'quebrada' }).set(asAdmin);

    expect(response.status).toBe(422);
  });
});
