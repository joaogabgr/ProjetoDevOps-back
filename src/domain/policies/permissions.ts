import { UserRole } from '../enums/UserRole';

/**
 * Matriz de permissões do RF9, num lugar só. As rotas e os testes leem daqui.
 *
 * | Ação                               | Admin | Técnico | Agente |
 * |------------------------------------|:-----:|:-------:|:------:|
 * | Gerenciar usuários                 |   x   |         |        |
 * | Gerenciar estações e parâmetros    |   x   |    x    |        |
 * | Gerenciar regras de alerta         |   x   |         |        |
 * | Ver estações e parâmetros          |   x   |    x    |   x    |
 */
export const Permission = {
  MANAGE_USERS: [UserRole.ADMIN],
  MANAGE_STATIONS: [UserRole.ADMIN, UserRole.TECHNICIAN],
  MANAGE_ALERTS: [UserRole.ADMIN],
  VIEW_STATIONS: [UserRole.ADMIN, UserRole.TECHNICIAN, UserRole.COMMUNITY_AGENT],
} as const satisfies Record<string, ReadonlyArray<UserRole>>;

export type Permission = keyof typeof Permission;
