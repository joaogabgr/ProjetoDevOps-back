import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { InMemoryStationRepository } from '../fakes/InMemoryStationRepository';
import {
  buildBoardTypeParameters,
  InMemoryTypeParameterRepository,
} from '../fakes/InMemoryTypeParameterRepository';
import { InMemoryUserRepository } from '../fakes/InMemoryUserRepository';
import { buildTestApp } from '../helpers/buildTestApp';

function buildApp() {
  return buildTestApp(
    new InMemoryStationRepository(),
    new InMemoryUserRepository(),
    new InMemoryTypeParameterRepository(buildBoardTypeParameters()),
  ).app;
}

describe('POST /api/type-parameters (SCRUM-18 — RF3: cadastrar parâmetro)', () => {
  it('retorna 201 com o parâmetro criado e o header Location', async () => {
    const response = await request(buildApp())
      .post('/api/type-parameters')
      .send({ typeJson: 'radiacao', name: 'Radiação Solar', unit: 'W/m²', numberOfDecimalCases: 0 });

    expect(response.status).toBe(201);
    expect(response.headers.location).toBe(`/api/type-parameters/${response.body.data.id}`);
    expect(response.body.data).toMatchObject({ typeJson: 'radiacao', unit: 'W/m²', factor: 1, offset: 0 });
  });

  it('usa 2 casas decimais quando não informado', async () => {
    const response = await request(buildApp())
      .post('/api/type-parameters')
      .send({ typeJson: 'radiacao', name: 'Radiação Solar', unit: 'W/m²' });

    expect(response.status).toBe(201);
    expect(response.body.data.numberOfDecimalCases).toBe(2);
  });

  it('retorna 409 quando a chave já existe', async () => {
    const response = await request(buildApp())
      .post('/api/type-parameters')
      .send({ typeJson: 'chuva', name: 'Outra chuva', unit: 'mm' });

    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe('CONFLICT');
  });

  it('retorna 422 quando a chave tem formato inválido', async () => {
    const response = await request(buildApp())
      .post('/api/type-parameters')
      .send({ typeJson: 'Vento Vel', name: 'Vento', unit: 'm/s' });

    expect(response.status).toBe(422);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });
});
