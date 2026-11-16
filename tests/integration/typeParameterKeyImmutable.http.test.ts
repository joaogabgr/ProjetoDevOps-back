import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { InMemoryStationRepository } from '../fakes/InMemoryStationRepository';
import { buildBoardTypeParameters, InMemoryTypeParameterRepository } from '../fakes/InMemoryTypeParameterRepository';
import { InMemoryUserRepository } from '../fakes/InMemoryUserRepository';
import { asAdmin, buildTestApp } from '../helpers/buildTestApp';

describe('Chave do parâmetro imutável (SCRUM-162 — RF3 R3)', () => {
  it('CA3: recusa mudar a chave de nivel para nivel_rio e a chave continua nivel', async () => {
    const { app } = buildTestApp(
      new InMemoryStationRepository(),
      new InMemoryUserRepository(),
      new InMemoryTypeParameterRepository(buildBoardTypeParameters()),
    );

    const response = await request(app)
      .patch('/api/type-parameters/7')
      .set(asAdmin)
      .send({ typeJson: 'nivel_rio', unit: 'm' });

    expect(response.status).toBe(422);
    expect(response.body.error.details).toContainEqual({
      field: 'typeJson',
      message: 'A chave do parâmetro não pode ser alterada.',
    });
    const list = await request(app).get('/api/type-parameters').set(asAdmin);
    const nivel = list.body.data.find((tp: { id: string }) => tp.id === '7');
    expect(nivel).toMatchObject({ typeJson: 'nivel', unit: 'cm' });
  });
});
