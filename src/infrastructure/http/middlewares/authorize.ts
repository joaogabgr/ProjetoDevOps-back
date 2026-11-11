import type { RequestHandler } from 'express';
import { ForbiddenError } from '../../../domain/errors/DomainError';
import { Permission } from '../../../domain/policies/permissions';
import { currentSession } from './authenticate';

/** Confere o perfil de quem está logado contra a matriz do RF9 (403 se não puder). */
export function authorize(permission: Permission): RequestHandler {
  const allowed: ReadonlyArray<string> = Permission[permission];

  return (req, _res, next) => {
    if (!allowed.includes(currentSession(req.auth).role)) {
      throw new ForbiddenError('Você não tem permissão para esta ação.');
    }
    next();
  };
}
