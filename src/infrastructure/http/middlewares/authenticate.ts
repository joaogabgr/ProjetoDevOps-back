import type { RequestHandler } from 'express';
import { UnauthorizedError } from '../../../domain/errors/DomainError';
import type { SessionPayload, TokenService } from '../../../domain/services/TokenService';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      /** Quem está logado; preenchido por `authenticate`. */
      auth?: SessionPayload;
    }
  }
}

/**
 * Confere o token `Authorization: Bearer ...` (RF9 R3 e R5).
 *
 * Sem token, token inválido ou sessão vencida (mais de 8 horas) viram 401 no `errorHandler`.
 */
export function authenticate(tokens: TokenService): RequestHandler {
  return (req, _res, next) => {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      throw new UnauthorizedError('Entre no sistema para continuar.');
    }

    req.auth = tokens.verify(header.slice('Bearer '.length).trim());
    next();
  };
}

/** Para handlers que só rodam depois de `authenticate`. */
export function currentSession(auth: SessionPayload | undefined): SessionPayload {
  if (!auth) {
    throw new UnauthorizedError('Entre no sistema para continuar.');
  }
  return auth;
}
