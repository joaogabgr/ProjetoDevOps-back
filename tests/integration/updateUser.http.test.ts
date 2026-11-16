import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { UserRole } from '../../src/domain/enums/UserRole';
import { buildUser } from '../fakes/InMemoryUserRepository';
import { asAdmin, buildTestApp } from '../helpers/buildTestApp';

describe('PATCH /api/users/:id (SCRUM-23 — RF5: editar usuário)', () => {
  it('atualiza o nome e retorna 200 com os dados atualizados', async () => {
    const { app, userRepository } = buildTestApp();
    const user = buildUser({ name: 'Nome Antigo' });
    await userRepository.seed([user]);

    const response = await request(app).patch(`/api/users/${user.id}`).set(asAdmin).send({ name: 'Nome Novo' });

    expect(response.status).toBe(200);
    expect(response.body.data.id).toBe(user.id);
    expect(response.body.data.name).toBe('Nome Novo');
  });

  it('altera a permissão do usuário', async () => {
    const { app, userRepository } = buildTestApp();
    const user = buildUser({ role: UserRole.TECHNICIAN });
    await userRepository.seed([user]);

    const response = await request(app)
      .patch(`/api/users/${user.id}`)
      .set(asAdmin)
      .send({ role: UserRole.ADMIN });

    expect(response.status).toBe(200);
    expect(response.body.data.role).toBe(UserRole.ADMIN);
  });

  it('desativa o usuário', async () => {
    const { app, userRepository } = buildTestApp();
    const user = buildUser({ active: true });
    await userRepository.seed([user]);

    const response = await request(app).patch(`/api/users/${user.id}`).set(asAdmin).send({ active: false });

    expect(response.status).toBe(200);
    expect(response.body.data.active).toBe(false);
  });

  it('não expõe nem altera o cpf ao editar outros campos', async () => {
    const { app, userRepository } = buildTestApp();
    const user = buildUser({ cpf: '11144477735' });
    await userRepository.seed([user]);

    const response = await request(app)
      .patch(`/api/users/${user.id}`)
      .set(asAdmin)
      .send({ name: 'Outro Nome' });

    expect(response.status).toBe(200);
    expect(response.body.data.cpf).toBe('11144477735');
  });

  it('retorna 404 quando o usuário não existe', async () => {
    const { app } = buildTestApp();

    const response = await request(app)
      .patch(`/api/users/${randomUUID()}`)
      .set(asAdmin)
      .send({ name: 'Não importa' });

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe('NOT_FOUND');
  });

  it('retorna 422 quando o id não é um uuid válido', async () => {
    const { app } = buildTestApp();

    const response = await request(app).patch('/api/users/nao-e-um-uuid').set(asAdmin).send({ name: 'X' });

    expect(response.status).toBe(422);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('retorna 422 quando o corpo da requisição está vazio', async () => {
    const { app, userRepository } = buildTestApp();
    const user = buildUser();
    await userRepository.seed([user]);

    const response = await request(app).patch(`/api/users/${user.id}`).set(asAdmin).send({});

    expect(response.status).toBe(422);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('retorna 422 quando o e-mail é inválido', async () => {
    const { app, userRepository } = buildTestApp();
    const user = buildUser();
    await userRepository.seed([user]);

    const response = await request(app)
      .patch(`/api/users/${user.id}`)
      .set(asAdmin)
      .send({ email: 'não-é-email' });

    expect(response.status).toBe(422);
  });

  it('retorna 422 quando a role não é um valor permitido', async () => {
    const { app, userRepository } = buildTestApp();
    const user = buildUser();
    await userRepository.seed([user]);

    const response = await request(app)
      .patch(`/api/users/${user.id}`)
      .set(asAdmin)
      .send({ role: 'SUPER_ADMIN' });

    expect(response.status).toBe(422);
  });

  it('retorna 409 quando o e-mail já pertence a outro usuário', async () => {
    const { app, userRepository } = buildTestApp();
    const userA = buildUser({ email: 'usuario.a@tecsus.com', cpf: '11144477735' });
    const userB = buildUser({ email: 'usuario.b@tecsus.com', cpf: '52998224725' });
    await userRepository.seed([userA, userB]);

    const response = await request(app)
      .patch(`/api/users/${userB.id}`)
      .set(asAdmin)
      .send({ email: 'usuario.a@tecsus.com' });

    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe('CONFLICT');
  });
});
