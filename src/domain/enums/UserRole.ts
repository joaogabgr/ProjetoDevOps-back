/**
 * Níveis de acesso do sistema (RF9).
 *
 * ADMIN    - acesso completo
 * EMPLOYEE - funcionalidades operacionais
 * PUBLIC   - apenas leitura das informações liberadas
 */
export const UserRole = {
  ADMIN: 'ADMIN',
  EMPLOYEE: 'EMPLOYEE',
  PUBLIC: 'PUBLIC',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const USER_ROLES = Object.values(UserRole);
