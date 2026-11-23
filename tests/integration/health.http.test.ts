import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { buildTestApp } from '../helpers/buildTestApp';

describe('Rota de saúde (SCRUM-251 — RNF4 R4)', () => {
  it('com o banco respondendo: 200, db ok e a versão publicada', async () => {
    const { app } = buildTestApp();

    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    // Sem APP_VERSION no ambiente (como nos testes), a versão é "dev".
    expect(response.body).toMatchObject({ status: 'ok', db: 'ok', version: 'dev' });
  });

  it('com o banco fora: 503 e db fora, para o teste depois de publicar falhar', async () => {
    const bancoFora = async () => {
      throw new Error('connect ECONNREFUSED');
    };
    const { app } = buildTestApp(undefined, undefined, undefined, bancoFora);

    const response = await request(app).get('/api/health');

    expect(response.status).toBe(503);
    expect(response.body).toEqual({ status: 'erro', db: 'fora', version: 'dev' });
  });

  it('não exige login', async () => {
    const { app } = buildTestApp();

    const response = await request(app).get('/api/health');

    expect(response.status).not.toBe(401);
  });
});
