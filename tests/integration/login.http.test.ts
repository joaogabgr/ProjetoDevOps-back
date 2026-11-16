import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { UserRole } from '../../src/domain/enums/UserRole';
import { buildUser } from '../fakes/InMemoryUserRepository';
import { buildTestApp, testTokenService } from '../helpers/buildTestApp';

async function setup() {
  const { app, userRepository } = buildTestApp();
  const ana = buildUser({
    name: 'Ana Técnica',
    email: 'ana@vigia.org',
    password: 'hashed:senha-certa',
    role: UserRole.TECHNICIAN,
  });
  await userRepository.seed([ana]);
  return { app, ana };
}

describe('POST /api/auth/login (SCRUM-116 — RF9: entrar com e-mail e senha)', () => {
  it('CA1: devolve o token da sessão, a validade e o usuário', async () => {
    const { app, ana } = await setup();

    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'ana@vigia.org', password: 'senha-certa' });

    expect(response.status).toBe(200);
    expect(response.body.data.user).toMatchObject({ id: ana.id, role: 'TECHNICIAN' });
    expect(response.body.data.user).not.toHaveProperty('password');
    expect(testTokenService.verify(response.body.data.token)).toMatchObject({ userId: ana.id, role: 'TECHNICIAN' });
  });

  it('a sessão vale 8 horas', async () => {
    const { app } = await setup();
    const before = Date.now();

    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'ana@vigia.org', password: 'senha-certa' });

    const hours = (new Date(response.body.data.expiresAt).getTime() - before) / 3_600_000;
    expect(hours).toBeGreaterThan(7.99);
    expect(hours).toBeLessThan(8.01);
  });

  it('aceita o e-mail com maiúsculas e espaços', async () => {
    const { app } = await setup();

    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: '  Ana@Vigia.org ', password: 'senha-certa' });

    expect(response.status).toBe(200);
  });

  it('CA2: senha errada devolve 401 sem dizer qual dos dois está errado', async () => {
    const { app } = await setup();

    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'ana@vigia.org', password: 'senha-errada' });

    expect(response.status).toBe(401);
    expect(response.body.error.message).toBe('E-mail ou senha incorretos.');
  });

  it('CA2: e-mail inexistente devolve a mesma mensagem', async () => {
    const { app } = await setup();

    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'ninguem@vigia.org', password: 'senha-certa' });

    expect(response.status).toBe(401);
    expect(response.body.error.message).toBe('E-mail ou senha incorretos.');
  });

  it('422 quando falta e-mail ou senha', async () => {
    const { app } = await setup();

    const response = await request(app).post('/api/auth/login').send({ email: 'ana@vigia.org' });

    expect(response.status).toBe(422);
  });
});
