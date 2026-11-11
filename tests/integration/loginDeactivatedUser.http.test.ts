import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { buildUser } from '../fakes/InMemoryUserRepository';
import { buildTestApp } from '../helpers/buildTestApp';

describe('Login de usuário desativado (SCRUM-212 — RF9 R2)', () => {
  it('CA3: senha certa de usuário desativado devolve 403 com a mensagem do RF9', async () => {
    const { app, userRepository } = buildTestApp();
    await userRepository.seed([buildUser({ email: 'jose@vigia.org', password: 'hashed:senha-certa', active: false })]);

    const response = await request(app).post('/api/auth/login').send({ email: 'jose@vigia.org', password: 'senha-certa' });

    expect(response.status).toBe(403);
    expect(response.body.error.message).toBe('Usuário desativado. Fale com o administrador.');
    expect(response.body.data).toBeUndefined();
  });

  it('senha errada de usuário desativado continua com a mensagem genérica', async () => {
    const { app, userRepository } = buildTestApp();
    await userRepository.seed([buildUser({ email: 'jose@vigia.org', password: 'hashed:senha-certa', active: false })]);

    const response = await request(app).post('/api/auth/login').send({ email: 'jose@vigia.org', password: 'errada' });

    expect(response.status).toBe(401);
    expect(response.body.error.message).toBe('E-mail ou senha incorretos.');
  });
});
