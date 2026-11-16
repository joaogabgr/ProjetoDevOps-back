import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { UserRole } from '../../src/domain/enums/UserRole';
import { buildStation } from '../fakes/InMemoryStationRepository';
import { asAdmin, authAs, buildTestApp } from '../helpers/buildTestApp';

describe('GET /api/stations/communities (SCRUM-151 — RF2 R3: sugerir comunidades)', () => {
  it('devolve as comunidades das estações, sem repetir e em ordem alfabética', async () => {
    const { app, stationRepository } = buildTestApp();
    await stationRepository.seed([
      buildStation({ community: 'São Benedito' }),
      buildStation({ community: 'Porto Esperança' }),
      buildStation({ community: 'São Benedito' }),
      buildStation({ community: 'Aldeia Kadiwéu' }),
    ]);

    const response = await request(app).get('/api/stations/communities').set(asAdmin);

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual(['Aldeia Kadiwéu', 'Porto Esperança', 'São Benedito']);
  });

  it('devolve lista vazia quando não há estações', async () => {
    const { app } = buildTestApp();

    const response = await request(app).get('/api/stations/communities').set(asAdmin);

    expect(response.body.data).toEqual([]);
  });

  it('técnico de campo também pode consultar', async () => {
    const { app } = buildTestApp();

    const response = await request(app).get('/api/stations/communities').set(authAs(UserRole.TECHNICIAN));

    expect(response.status).toBe(200);
  });
});
