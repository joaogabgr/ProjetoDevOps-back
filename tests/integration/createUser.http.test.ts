import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { UserRole } from '../../src/domain/enums/UserRole';
import { buildUser } from '../fakes/InMemoryUserRepository';
import { buildTestApp } from '../helpers/buildTestApp';

describe('POST /api/users (SCRUM-22 — RF5: cadastrar usuário)', () => {
  const validPayload = {
    name: 'Ana Souza',
    email: 'ana.souza@tecsus.com',
    password: 'senha-forte-123',
    cpf: '111.444.777-35',
    role: UserRole.ADMIN,
  };

  it('cadastra o usuário e retorna 201 com Location e sem a senha', async () => {
    const { app } = buildTestApp();

    const response = await request(app).post('/api/users').send(validPayload);

    expect(response.status).toBe(201);
    expect(response.headers.location).toBe(`/api/users/${response.body.data.id}`);
    expect(response.body.data).toMatchObject({
      name: 'Ana Souza',
      email: 'ana.souza@tecsus.com',
      cpf: '11144477735',
      role: UserRole.ADMIN,
      active: true,
    });
    expect(response.body.data.password).toBeUndefined();
  });

  it('retorna 422 quando falta um campo obrigatório', async () => {
    const { app } = buildTestApp();
    const { password: _password, ...withoutPassword } = validPayload;

    const response = await request(app).post('/api/users').send(withoutPassword);

    expect(response.status).toBe(422);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('retorna 422 quando o e-mail é inválido', async () => {
    const { app } = buildTestApp();

    const response = await request(app)
      .post('/api/users')
      .send({ ...validPayload, email: 'não-é-email' });

    expect(response.status).toBe(422);
  });

  it('retorna 422 quando a senha é menor que 8 caracteres', async () => {
    const { app } = buildTestApp();

    const response = await request(app).post('/api/users').send({ ...validPayload, password: '123' });

    expect(response.status).toBe(422);
  });

  it('retorna 422 quando o CPF tem dígito verificador inválido', async () => {
    const { app } = buildTestApp();

    const response = await request(app)
      .post('/api/users')
      .send({ ...validPayload, cpf: '111.444.777-36' });

    expect(response.status).toBe(422);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('retorna 422 quando a role não é um valor permitido', async () => {
    const { app } = buildTestApp();

    const response = await request(app)
      .post('/api/users')
      .send({ ...validPayload, role: 'SUPER_ADMIN' });

    expect(response.status).toBe(422);
  });

  it('retorna 409 quando o e-mail já está cadastrado', async () => {
    const { app, userRepository } = buildTestApp();
    await userRepository.seed([buildUser({ email: 'ana.souza@tecsus.com', cpf: '52998224725' })]);

    const response = await request(app).post('/api/users').send(validPayload);

    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe('CONFLICT');
  });

  it('retorna 409 quando o CPF já está cadastrado', async () => {
    const { app, userRepository } = buildTestApp();
    await userRepository.seed([buildUser({ email: 'outro@tecsus.com', cpf: '11144477735' })]);

    const response = await request(app).post('/api/users').send(validPayload);

    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe('CONFLICT');
  });
});
