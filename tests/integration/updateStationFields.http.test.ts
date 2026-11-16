import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { buildStation } from '../fakes/InMemoryStationRepository';
import { asAdmin, buildTestApp } from '../helpers/buildTestApp';

async function setup() {
  const { app, stationRepository } = buildTestApp();
  const station = buildStation({ uuid: 'PCD-AMZ-01', community: 'Aldeia', timezone: 'America/Campo_Grande' });
  await stationRepository.seed([station]);
  return { app, station };
}

describe('PATCH /api/stations/:id com os campos do RF2 (SCRUM-155)', () => {
  it('edita bioma, comunidade, fuso e tempo limite', async () => {
    const { app, station } = await setup();

    const response = await request(app).patch(`/api/stations/${station.id}`).set(asAdmin).send({
      biome: 'AMAZONIA',
      community: 'Comunidade Boa Esperança',
      timezone: 'America/Belem',
      communicationTimeoutMinutes: 180,
    });

    expect(response.status).toBe(200);
    expect(response.body.data).toMatchObject({
      uuid: 'PCD-AMZ-01',
      biome: 'AMAZONIA',
      community: 'Comunidade Boa Esperança',
      timezone: 'America/Belem',
      communicationTimeoutMinutes: 180,
    });
  });

  it('recusa trocar o identificador', async () => {
    const { app, station } = await setup();

    const response = await request(app).patch(`/api/stations/${station.id}`).set(asAdmin).send({ uuid: 'PCD-AMZ-99' });

    expect(response.status).toBe(422);
    expect(response.body.error.details).toContainEqual({ field: 'uuid', message: 'O identificador não pode ser alterado.' });
  });

  it('aplica a mesma faixa de tempo limite do cadastro', async () => {
    const { app, station } = await setup();

    const response = await request(app)
      .patch(`/api/stations/${station.id}`)
      .set(asAdmin)
      .send({ communicationTimeoutMinutes: 2000 });

    expect(response.status).toBe(422);
  });

  it('recusa fuso inválido', async () => {
    const { app, station } = await setup();

    const response = await request(app).patch(`/api/stations/${station.id}`).set(asAdmin).send({ timezone: 'Brasil' });

    expect(response.status).toBe(422);
  });
});
