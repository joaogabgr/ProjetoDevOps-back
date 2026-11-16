/**
 * Perfis de acesso definidos pelo cliente (RF5, RF9).
 *
 * ADMIN           - equipe fixa da ONG: gerencia tudo
 * TECHNICIAN      - técnico de campo: estações, parâmetros e manutenção
 * COMMUNITY_AGENT - liderança da comunidade: vê os dados da sua comunidade e recebe alertas
 *
 * O público sem login não é um perfil: ele só acessa o painel público (RF11).
 */
export const UserRole = {
  ADMIN: 'ADMIN',
  TECHNICIAN: 'TECHNICIAN',
  COMMUNITY_AGENT: 'COMMUNITY_AGENT',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const USER_ROLES = Object.values(UserRole);
