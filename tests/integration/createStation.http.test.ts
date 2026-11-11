import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { InMemoryStationRepository } from '../fakes/InMemoryStationRepository';
import { buildBoardTypeParameters, InMemoryTypeParameterRepository } from '../fakes/InMemoryTypeParameterRepository';
import { InMemoryUserRepository } from '../fakes/InMemoryUserRepository';
import { buildTestApp } from '../helpers/buildTestApp';

function setup() {
  return buildTestApp(
    new InMemoryStationRepository(),
    new InMemoryUserRepository(),
    new InMemoryTypeParameterRepository(buildBoardTypeParameters()),
  );
}

const validBody = {
  uuid: 'PCD-PAN-03',
  name: 'Rio Miranda – São Benedito',
  latitude: '-20.2418',
  longitude: '-56.3792',
  biome: 'PANTANAL',
  community: 'São Benedito',
  timezone: 'America/Campo_Grande',
  typeParameterIds: ['6', '7'],
};

describe('POST /api/stations (SCRUM-57 — RF2: cadastrar estação com identificação e localização)', () => {
  it('cadastra a estação com bioma, comunidade e fuso, ativa e com tempo limite padrão de 60 minutos', async () => {
    const { app } = setup();

    const response = await request(app).post('/api/stations').send(validBody);

    expect(response.status).toBe(201);
    expect(response.body.data).toMatchObject({
      uuid: 'PCD-PAN-03',
      biome: 'PANTANAL',
      community: 'São Benedito',
      timezone: 'America/Campo_Grande',
      communicationTimeoutMinutes: 60,
      active: true,
    });
  });

  it('aceita um tempo limite informado dentro da faixa', async () => {
    const { app } = setup();

    const response = await request(app)
      .post('/api/stations')
      .send({ ...validBody, communicationTimeoutMinutes: 180 });

    expect(response.status).toBe(201);
    expect(response.body.data.communicationTimeoutMinutes).toBe(180);
  });

  it('CA1: recusa uid repetido com 409 apontando o campo, sem gravar nada', async () => {
    const { app, stationRepository } = setup();
    await request(app).post('/api/stations').send(validBody).expect(201);

    const response = await request(app).post('/api/stations').send({ ...validBody, name: 'Outra' });

    expect(response.status).toBe(409);
    expect(response.body.error.details).toEqual([
      { field: 'uuid', message: 'Já existe uma estação com este identificador.' },
    ]);
    const list = await stationRepository.list({ page: 1, perPage: 20 });
    expect(list.total).toBe(1);
  });

  it('CA2: recusa tempo limite fora da faixa de 15 a 1440 minutos', async () => {
    const { app } = setup();

    const response = await request(app)
      .post('/api/stations')
      .send({ ...validBody, communicationTimeoutMinutes: 10 });

    expect(response.status).toBe(422);
    expect(response.body.error.details).toContainEqual({
      field: 'communicationTimeoutMinutes',
      message: 'O tempo limite deve ficar entre 15 e 1440 minutos.',
    });
  });

  it('recusa bioma fora da lista', async () => {
    const { app } = setup();

    const response = await request(app).post('/api/stations').send({ ...validBody, biome: 'CAATINGA' });

    expect(response.status).toBe(422);
    expect(response.body.error.details[0].field).toBe('biome');
  });

  it('recusa fuso que não está no formato IANA', async () => {
    const { app } = setup();

    const response = await request(app).post('/api/stations').send({ ...validBody, timezone: 'GMT-4 Campo Grande' });

    expect(response.status).toBe(422);
    expect(response.body.error.details[0].field).toBe('timezone');
  });

  it('recusa estação sem comunidade', async () => {
    const { app } = setup();
    const { community: _ignored, ...withoutCommunity } = validBody;

    const response = await request(app).post('/api/stations').send(withoutCommunity);

    expect(response.status).toBe(422);
    expect(response.body.error.details[0].field).toBe('community');
  });
});
