import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { InMemoryStationRepository } from '../fakes/InMemoryStationRepository';
import {
  buildBoardTypeParameters,
  InMemoryTypeParameterRepository,
} from '../fakes/InMemoryTypeParameterRepository';
import { InMemoryUserRepository } from '../fakes/InMemoryUserRepository';
import { buildTestApp } from '../helpers/buildTestApp';

describe('GET /api/type-parameters (SCRUM-20 — RF3: listar parâmetros)', () => {
  it('retorna 200 com lista vazia quando não há parâmetros', async () => {
    const { app } = buildTestApp();

    const response = await request(app).get('/api/type-parameters');

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual([]);
  });

  it('lista as chaves que as placas enviam, com a unidade de cada uma', async () => {
    const { app } = buildTestApp(
      new InMemoryStationRepository(),
      new InMemoryUserRepository(),
      new InMemoryTypeParameterRepository(buildBoardTypeParameters()),
    );

    const response = await request(app).get('/api/type-parameters');

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(7);
    const units = Object.fromEntries(
      response.body.data.map((tp: { typeJson: string; unit: string }) => [tp.typeJson, tp.unit]),
    );
    expect(units).toEqual({
      chuva: 'mm',
      nivel: 'cm',
      pressao: 'hPa',
      temp: '°C',
      umid: '%',
      vento_dir: '°',
      vento_vel: 'm/s',
    });
  });
});
