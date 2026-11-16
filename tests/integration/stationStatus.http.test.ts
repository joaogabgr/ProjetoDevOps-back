import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { UserRole } from '../../src/domain/enums/UserRole';
import { buildStation } from '../fakes/InMemoryStationRepository';
import { asAdmin, authAs, buildTestApp } from '../helpers/buildTestApp';

async function setup(measures = 0) {
  const { app, stationRepository } = buildTestApp();
  const station = buildStation({ uuid: 'PCD-PAN-03' });
  await stationRepository.seed([station]);
  stationRepository.recordMeasures(station.id, measures);
  return { app, station };
}

describe('Excluir ou desativar estação (SCRUM-63 — RF2 R3 e R4)', () => {
  it('CA2: estação com leituras não pode ser excluída', async () => {
    const { app, station } = await setup(2592);

    const response = await request(app).delete(`/api/stations/${station.id}`).set(asAdmin);

    expect(response.status).toBe(409);
    expect(response.body.error.message).toBe('Estação com leituras não pode ser excluída. Desative-a.');
    expect((await request(app).get(`/api/stations/${station.id}`).set(asAdmin)).status).toBe(200);
  });

  it('estação sem leituras continua podendo ser excluída', async () => {
    const { app, station } = await setup(0);

    expect((await request(app).delete(`/api/stations/${station.id}`).set(asAdmin)).status).toBe(204);
  });

  it('desativa a estação e ela continua consultável', async () => {
    const { app, station } = await setup(2592);

    const response = await request(app)
      .patch(`/api/stations/${station.id}/status`)
      .set(asAdmin)
      .send({ active: false });

    expect(response.status).toBe(200);
    expect(response.body.data.active).toBe(false);
    const again = await request(app).get(`/api/stations/${station.id}`).set(asAdmin);
    expect(again.body.data.active).toBe(false);
  });

  it('reativa a estação', async () => {
    const { app, station } = await setup();
    await request(app).patch(`/api/stations/${station.id}/status`).set(asAdmin).send({ active: false });

    const response = await request(app).patch(`/api/stations/${station.id}/status`).set(asAdmin).send({ active: true });

    expect(response.body.data.active).toBe(true);
  });

  it('422 sem o campo active', async () => {
    const { app, station } = await setup();

    expect((await request(app).patch(`/api/stations/${station.id}/status`).set(asAdmin).send({})).status).toBe(422);
  });

  it('agente comunitário não desativa estação', async () => {
    const { app, station } = await setup();

    const response = await request(app)
      .patch(`/api/stations/${station.id}/status`)
      .set(authAs(UserRole.COMMUNITY_AGENT, 'São Benedito'))
      .send({ active: false });

    expect(response.status).toBe(403);
  });
});
