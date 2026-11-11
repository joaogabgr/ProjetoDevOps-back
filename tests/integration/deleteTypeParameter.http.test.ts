import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { UserRole } from '../../src/domain/enums/UserRole';
import { InMemoryStationRepository } from '../fakes/InMemoryStationRepository';
import { buildBoardTypeParameters, InMemoryTypeParameterRepository } from '../fakes/InMemoryTypeParameterRepository';
import { InMemoryUserRepository } from '../fakes/InMemoryUserRepository';
import { asAdmin, authAs, buildTestApp } from '../helpers/buildTestApp';

function setup() {
  const typeParameters = new InMemoryTypeParameterRepository(buildBoardTypeParameters());
  const { app } = buildTestApp(new InMemoryStationRepository(), new InMemoryUserRepository(), typeParameters);
  return { app, typeParameters };
}

describe('DELETE /api/type-parameters/:id (SCRUM-71 — RF3: excluir parâmetro)', () => {
  it('exclui o parâmetro e ele some da lista', async () => {
    const { app } = setup();

    const response = await request(app).delete('/api/type-parameters/3').set(asAdmin);

    expect(response.status).toBe(204);
    const list = await request(app).get('/api/type-parameters').set(asAdmin);
    expect(list.body.data.map((tp: { typeJson: string }) => tp.typeJson)).not.toContain('pressao');
  });

  it('CA4: recusa excluir parâmetro com leituras', async () => {
    const { app, typeParameters } = setup();
    typeParameters.recordMeasures('6', 2592);

    const response = await request(app).delete('/api/type-parameters/6').set(asAdmin);

    expect(response.status).toBe(409);
    expect(response.body.error.message).toBe('Parâmetro com leituras não pode ser excluído.');
  });

  it('R5: parâmetro instalado mas sem leituras é desligado das estações e excluído', async () => {
    const { app, typeParameters } = setup();
    typeParameters.linkToStations('7', 2);

    const response = await request(app).delete('/api/type-parameters/7').set(asAdmin);

    expect(response.status).toBe(204);
    expect(await typeParameters.countStationLinks('7')).toBe(0);
  });

  it('404 para parâmetro inexistente', async () => {
    const { app } = setup();

    expect((await request(app).delete('/api/type-parameters/999').set(asAdmin)).status).toBe(404);
  });

  it('agente comunitário não exclui parâmetro', async () => {
    const { app } = setup();

    const response = await request(app)
      .delete('/api/type-parameters/3')
      .set(authAs(UserRole.COMMUNITY_AGENT, 'São Benedito'));

    expect(response.status).toBe(403);
  });
});
