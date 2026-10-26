import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { UserRole } from '../../src/domain/enums/UserRole';
import { buildUser } from '../fakes/InMemoryUserRepository';
import { buildTestApp } from '../helpers/buildTestApp';

describe('GET /api/users (SCRUM-24 — RF5: listar usuários)', () => {
  it('retorna 200 com lista vazia quando não há usuários', async () => {
    const { app } = buildTestApp();

    const response = await request(app).get('/api/users');

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual([]);
    expect(response.body.meta).toEqual({ total: 0, page: 1, perPage: 20, totalPages: 0 });
  });

  it('lista os usuários com metadados de paginação e sem a senha', async () => {
    const { app, userRepository } = buildTestApp();
    await userRepository.seed([
      buildUser({ name: 'Bruno', email: 'bruno@example.com', password: 'hash-secreto' }),
      buildUser({ name: 'Ana', email: 'ana@example.com' }),
    ]);

    const response = await request(app).get('/api/users');

    expect(response.status).toBe(200);
    expect(response.body.data.map((u: { name: string }) => u.name)).toEqual(['Ana', 'Bruno']);
    expect(response.body.meta).toEqual({ total: 2, page: 1, perPage: 20, totalPages: 1 });
    expect(response.text).not.toContain('hash-secreto');
  });

  it('filtra por perfil e pagina via query string', async () => {
    const { app, userRepository } = buildTestApp();
    await userRepository.seed([
      buildUser({ name: 'Ana', email: 'ana@example.com', role: UserRole.ADMIN }),
      buildUser({ name: 'Bruno', email: 'bruno@example.com', role: UserRole.EMPLOYEE }),
      buildUser({ name: 'Carla', email: 'carla@example.com', role: UserRole.EMPLOYEE }),
      buildUser({ name: 'Diego', email: 'diego@example.com', role: UserRole.EMPLOYEE }),
    ]);

    const response = await request(app)
      .get('/api/users')
      .query({ role: UserRole.EMPLOYEE, page: 2, perPage: 2 });

    expect(response.status).toBe(200);
    expect(response.body.data.map((u: { name: string }) => u.name)).toEqual(['Diego']);
    expect(response.body.meta).toEqual({ total: 3, page: 2, perPage: 2, totalPages: 2 });
  });

  it('retorna 422 quando o perfil não existe', async () => {
    const { app } = buildTestApp();

    const response = await request(app).get('/api/users').query({ role: 'SUPERUSER' });

    expect(response.status).toBe(422);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });
});
