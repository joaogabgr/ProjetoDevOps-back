import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { UserRole } from '../../src/domain/enums/UserRole';
import { authAs, buildTestApp } from '../helpers/buildTestApp';

describe('Login e perfil nas rotas (SCRUM-84 — RF9 R5 e R6)', () => {
  it('CA2: sem login, a lista de usuários devolve 401', async () => {
    const { app } = buildTestApp();

    const response = await request(app).get('/api/users');

    expect(response.status).toBe(401);
  });

  it('sem login, estações e parâmetros também devolvem 401', async () => {
    const { app } = buildTestApp();

    expect((await request(app).get('/api/stations')).status).toBe(401);
    expect((await request(app).get('/api/type-parameters')).status).toBe(401);
  });

  it('o health check continua público', async () => {
    const { app } = buildTestApp();

    expect((await request(app).get('/api/health')).status).toBe(200);
  });

  it('técnico de campo recebe 403 na lista de usuários', async () => {
    const { app } = buildTestApp();

    const response = await request(app).get('/api/users').set(authAs(UserRole.TECHNICIAN));

    expect(response.status).toBe(403);
    expect(response.body.error.message).toBe('Você não tem permissão para esta ação.');
  });

  it('agente comunitário vê estações, mas não cadastra', async () => {
    const { app } = buildTestApp();
    const agent = authAs(UserRole.COMMUNITY_AGENT, 'São Benedito');

    expect((await request(app).get('/api/stations').set(agent)).status).toBe(200);
    expect((await request(app).post('/api/stations').set(agent).send({})).status).toBe(403);
  });

  it('técnico de campo cadastra parâmetro', async () => {
    const { app } = buildTestApp();

    const response = await request(app)
      .post('/api/type-parameters')
      .set(authAs(UserRole.TECHNICIAN))
      .send({ typeJson: 'radiacao', name: 'Radiação Solar', unit: 'W/m²' });

    expect(response.status).toBe(201);
  });
});
