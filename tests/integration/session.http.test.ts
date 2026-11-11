import jwt from 'jsonwebtoken';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { UserRole } from '../../src/domain/enums/UserRole';
import { buildUser } from '../fakes/InMemoryUserRepository';
import { buildTestApp, testTokenService } from '../helpers/buildTestApp';

const TEST_SECRET = 'segredo-de-teste-com-pelo-menos-32-caracteres';

async function setup() {
  const { app, userRepository } = buildTestApp();
  const ana = buildUser({ email: 'ana@vigia.org', role: UserRole.TECHNICIAN });
  await userRepository.seed([ana]);
  return { app, ana, userRepository };
}

describe('Sessão de 8 horas (SCRUM-211 — RF9 R3)', () => {
  it('GET /api/auth/me devolve quem está logado', async () => {
    const { app, ana } = await setup();
    const { token } = testTokenService.issue({ userId: ana.id, role: ana.role, community: null });

    const response = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data).toMatchObject({ id: ana.id, email: 'ana@vigia.org' });
  });

  it('sem token devolve 401', async () => {
    const { app } = await setup();

    const response = await request(app).get('/api/auth/me');

    expect(response.status).toBe(401);
    expect(response.body.error.message).toBe('Entre no sistema para continuar.');
  });

  it('CA4: sessão com mais de 8 horas devolve 401 com "Sessão expirada"', async () => {
    const { app, ana } = await setup();
    const nineHoursAgo = Math.floor(Date.now() / 1000) - 9 * 3600;
    const expired = jwt.sign(
      { role: ana.role, community: null, iat: nineHoursAgo, exp: nineHoursAgo + 8 * 3600 },
      TEST_SECRET,
      { subject: ana.id },
    );

    const response = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${expired}`);

    expect(response.status).toBe(401);
    expect(response.body.error.message).toBe('Sessão expirada. Entre novamente.');
  });

  it('token assinado com outro segredo devolve 401', async () => {
    const { app, ana } = await setup();
    const forged = jwt.sign({ role: 'ADMIN', community: null }, 'outro-segredo-qualquer-com-32-caracteres', {
      subject: ana.id,
      expiresIn: 3600,
    });

    const response = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${forged}`);

    expect(response.status).toBe(401);
    expect(response.body.error.message).toBe('Sessão inválida. Entre novamente.');
  });

  it('usuário desativado depois do login perde a sessão', async () => {
    const { app, ana, userRepository } = await setup();
    const { token } = testTokenService.issue({ userId: ana.id, role: ana.role, community: null });
    await userRepository.update(ana.id, { active: false });

    const response = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(401);
  });
});
