import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { UserRole } from '../../src/domain/enums/UserRole';
import { rolesFor, type Permission } from '../../src/domain/policies/permissions';
import { InMemoryStationRepository } from '../fakes/InMemoryStationRepository';
import { buildBoardTypeParameters, InMemoryTypeParameterRepository } from '../fakes/InMemoryTypeParameterRepository';
import { InMemoryUserRepository } from '../fakes/InMemoryUserRepository';
import { authAs, buildTestApp } from '../helpers/buildTestApp';

type Method = 'get' | 'post' | 'patch' | 'delete';

/** Cada linha da matriz do RF9 com uma rota que a representa. */
const MATRIX: Array<{ action: string; permission: Permission; method: Method; path: string }> = [
  { action: 'listar usuários', permission: 'MANAGE_USERS', method: 'get', path: '/api/users' },
  { action: 'cadastrar usuário', permission: 'MANAGE_USERS', method: 'post', path: '/api/users' },
  { action: 'cadastrar estação', permission: 'MANAGE_STATIONS', method: 'post', path: '/api/stations' },
  { action: 'cadastrar parâmetro', permission: 'MANAGE_STATIONS', method: 'post', path: '/api/type-parameters' },
  { action: 'editar parâmetro', permission: 'MANAGE_STATIONS', method: 'patch', path: '/api/type-parameters/7' },
  { action: 'excluir parâmetro', permission: 'MANAGE_STATIONS', method: 'delete', path: '/api/type-parameters/3' },
  { action: 'listar estações', permission: 'VIEW_STATIONS', method: 'get', path: '/api/stations' },
  { action: 'listar parâmetros', permission: 'VIEW_STATIONS', method: 'get', path: '/api/type-parameters' },
];

const ROLES = [UserRole.ADMIN, UserRole.TECHNICIAN, UserRole.COMMUNITY_AGENT];

function buildApp() {
  return buildTestApp(
    new InMemoryStationRepository(),
    new InMemoryUserRepository(),
    new InMemoryTypeParameterRepository(buildBoardTypeParameters()),
  ).app;
}

describe('Matriz de permissões do RF9 (SCRUM-217)', () => {
  for (const row of MATRIX) {
    for (const role of ROLES) {
      const allowed = rolesFor(row.permission).includes(role);

      it(`${role} ${allowed ? 'pode' : 'não pode'} ${row.action}`, async () => {
        const response = await request(buildApp())
          [row.method](row.path)
          .set(authAs(role, role === UserRole.COMMUNITY_AGENT ? 'São Benedito' : null))
          .send({});

        if (allowed) {
          expect([401, 403]).not.toContain(response.status);
        } else {
          expect(response.status).toBe(403);
        }
      });
    }

    it(`sem login não dá para ${row.action}`, async () => {
      const response = await request(buildApp())[row.method](row.path).send({});

      expect(response.status).toBe(401);
    });
  }
});
