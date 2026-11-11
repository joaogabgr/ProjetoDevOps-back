import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { UserRole } from '../../src/domain/enums/UserRole';
import { InMemoryStationRepository } from '../fakes/InMemoryStationRepository';
import { buildBoardTypeParameters, InMemoryTypeParameterRepository } from '../fakes/InMemoryTypeParameterRepository';
import { InMemoryUserRepository } from '../fakes/InMemoryUserRepository';
import { asAdmin, authAs, buildTestApp } from '../helpers/buildTestApp';

function buildApp() {
  return buildTestApp(
    new InMemoryStationRepository(),
    new InMemoryUserRepository(),
    new InMemoryTypeParameterRepository(buildBoardTypeParameters()),
  ).app;
}

describe('PATCH /api/type-parameters/:id (SCRUM-67 — RF3: editar parâmetro)', () => {
  it('altera nome, unidade e casas decimais', async () => {
    const response = await request(buildApp())
      .patch('/api/type-parameters/7')
      .set(asAdmin)
      .send({ name: 'Nível do Rio Miranda', unit: 'm', numberOfDecimalCases: 2 });

    expect(response.status).toBe(200);
    expect(response.body.data).toMatchObject({
      id: '7',
      typeJson: 'nivel',
      name: 'Nível do Rio Miranda',
      unit: 'm',
      numberOfDecimalCases: 2,
    });
  });

  it('altera só o campo enviado', async () => {
    const response = await request(buildApp()).patch('/api/type-parameters/7').set(asAdmin).send({ unit: 'm' });

    expect(response.body.data).toMatchObject({ name: 'Nível do Rio', unit: 'm', numberOfDecimalCases: 1 });
  });

  it('recusa nome que já é de outro parâmetro, apontando o campo', async () => {
    const response = await request(buildApp())
      .patch('/api/type-parameters/7')
      .set(asAdmin)
      .send({ name: 'Temperatura' });

    expect(response.status).toBe(409);
    expect(response.body.error.details).toEqual([{ field: 'name', message: 'Já existe um parâmetro com este nome.' }]);
  });

  it('recusa casas decimais fora de 0 a 6', async () => {
    const response = await request(buildApp())
      .patch('/api/type-parameters/7')
      .set(asAdmin)
      .send({ numberOfDecimalCases: 7 });

    expect(response.status).toBe(422);
  });

  it('404 para parâmetro inexistente', async () => {
    const response = await request(buildApp()).patch('/api/type-parameters/999').set(asAdmin).send({ unit: 'm' });

    expect(response.status).toBe(404);
  });

  it('agente comunitário não edita parâmetro', async () => {
    const response = await request(buildApp())
      .patch('/api/type-parameters/7')
      .set(authAs(UserRole.COMMUNITY_AGENT, 'São Benedito'))
      .send({ unit: 'm' });

    expect(response.status).toBe(403);
  });
});
