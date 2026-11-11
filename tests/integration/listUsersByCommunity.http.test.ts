import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { UserRole } from '../../src/domain/enums/UserRole';
import { buildUser } from '../fakes/InMemoryUserRepository';
import { asAdmin, buildTestApp } from '../helpers/buildTestApp';

describe('GET /api/users filtrando por comunidade (SCRUM-80 — RF5 R6)', () => {
  it('devolve só os usuários da comunidade pedida', async () => {
    const { app, userRepository } = buildTestApp();
    await userRepository.seed([
      buildUser({ name: 'Ana', email: 'ana@vigia.org', role: UserRole.COMMUNITY_AGENT, community: 'São Benedito' }),
      buildUser({ name: 'Bia', email: 'bia@vigia.org', role: UserRole.COMMUNITY_AGENT, community: 'Porto Esperança' }),
      buildUser({ name: 'Caio', email: 'caio@vigia.org', role: UserRole.COMMUNITY_AGENT, community: 'São Benedito' }),
      buildUser({ name: 'Davi', email: 'davi@vigia.org', role: UserRole.TECHNICIAN }),
    ]);

    const response = await request(app).get('/api/users').query({ community: 'São Benedito' }).set(asAdmin);

    expect(response.status).toBe(200);
    expect(response.body.data.map((u: { name: string }) => u.name)).toEqual(['Ana', 'Caio']);
  });

  it('combina comunidade e perfil', async () => {
    const { app, userRepository } = buildTestApp();
    await userRepository.seed([
      buildUser({ name: 'Ana', email: 'ana@vigia.org', role: UserRole.COMMUNITY_AGENT, community: 'São Benedito' }),
      buildUser({ name: 'Davi', email: 'davi@vigia.org', role: UserRole.TECHNICIAN }),
    ]);

    const response = await request(app)
      .get('/api/users')
      .query({ community: 'São Benedito', role: 'TECHNICIAN' })
      .set(asAdmin);

    expect(response.body.data).toEqual([]);
  });
});
