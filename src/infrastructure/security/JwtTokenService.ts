import jwt from 'jsonwebtoken';
import { UnauthorizedError } from '../../domain/errors/DomainError';
import type { IssuedToken, SessionPayload, TokenService } from '../../domain/services/TokenService';

/** Sessão em JWT assinado (HS256), com validade de `sessionHours` (RF9 R3: 8 horas). */
export class JwtTokenService implements TokenService {
  constructor(
    private readonly secret: string,
    private readonly sessionHours: number,
  ) {}

  issue(payload: SessionPayload): IssuedToken {
    const expiresInSeconds = Math.round(this.sessionHours * 60 * 60);
    const token = jwt.sign({ role: payload.role, community: payload.community }, this.secret, {
      subject: payload.userId,
      expiresIn: expiresInSeconds,
      algorithm: 'HS256',
    });

    return { token, expiresAt: new Date(Date.now() + expiresInSeconds * 1000) };
  }

  verify(token: string): SessionPayload {
    try {
      const decoded = jwt.verify(token, this.secret, { algorithms: ['HS256'] }) as jwt.JwtPayload;
      return {
        userId: String(decoded.sub),
        role: decoded.role,
        community: decoded.community ?? null,
      };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedError('Sessão expirada. Entre novamente.');
      }
      throw new UnauthorizedError('Sessão inválida. Entre novamente.');
    }
  }
}
