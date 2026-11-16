import type { UserRole } from '../enums/UserRole';

/** O que a sessão carrega: quem é o usuário e o que ele pode ver (RF9). */
export interface SessionPayload {
  readonly userId: string;
  readonly role: UserRole;
  readonly community: string | null;
}

export interface IssuedToken {
  readonly token: string;
  readonly expiresAt: Date;
}

/** Porta para emitir e conferir o token da sessão. */
export interface TokenService {
  issue(payload: SessionPayload): IssuedToken;
  /** Lança `UnauthorizedError` se o token for inválido ou estiver vencido. */
  verify(token: string): SessionPayload;
}
