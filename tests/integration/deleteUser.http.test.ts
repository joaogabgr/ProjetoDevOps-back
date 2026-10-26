import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { UserRole } from '../../src/domain/enums/UserRole';
import { buildUser } from '../fakes/InMemoryUserRepository';
import { buildTestApp } from '../helpers/buildTestApp';

describe('DELETE /api/users/:id (SCRUM-25 — RF5: excluir usuário)', () => {
  it('retorna 204 e remove o usuário', async () => {
    const { app, userRepository } = buildTestApp();
    const user = buildUser();
    await userRepository.seed([user]);

    const response = await request(app).delete(`/api/users/${user.id}`);

    expect(response.status).toBe(204);
    expect(await userRepository.findById(user.id)).toBeNull();
  });

  it('retorna 409 ao excluir o último administrador ativo', async () => {
    const { app, userRepository } = buildTestApp();
    const admin = buildUser({ role: UserRole.ADMIN });
    await userRepository.seed([admin]);

    const response = await request(app).delete(`/api/users/${admin.id}`);

    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe('CONFLICT');
  });

  it('retorna 409 ao desativar o último administrador ativo', async () => {
    const { app, userRepository } = buildTestApp();
    const admin = buildUser({ role: UserRole.ADMIN });
    await userRepository.seed([admin]);

    const response = await request(app).patch(`/api/users/${admin.id}`).send({ active: false });

    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe('CONFLICT');
  });

  it('retorna 404 quando o usuário não existe', async () => {
    const { app } = buildTestApp();

    const response = await request(app).delete('/api/users/00000000-0000-4000-8000-000000000000');

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe('NOT_FOUND');
  });

  it('retorna 422 quando o id não é um UUID', async () => {
    const { app } = buildTestApp();

    const response = await request(app).delete('/api/users/abc');

    expect(response.status).toBe(422);
  });
});
