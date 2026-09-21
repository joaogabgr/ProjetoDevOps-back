import type { ErrorRequestHandler, RequestHandler } from 'express';
import { QueryFailedError } from 'typeorm';
import { ZodError } from 'zod';
import {
  ConflictError,
  DomainError,
  NotFoundError,
  ValidationError,
} from '../../../domain/errors/DomainError';
import { isProduction } from '../../config/env';

/** Código de violação de unique constraint do PostgreSQL. */
const PG_UNIQUE_VIOLATION = '23505';

const STATUS_BY_ERROR = new Map<string, number>([
  [NotFoundError.name, 404],
  [ConflictError.name, 409],
  [ValidationError.name, 422],
]);

export const notFoundHandler: RequestHandler = (req, res) => {
  res.status(404).json({
    error: { code: 'ROUTE_NOT_FOUND', message: `Rota ${req.method} ${req.originalUrl} não existe.` },
  });
};

/**
 * Único ponto onde um erro vira resposta HTTP.
 *
 * Erros conhecidos viram mensagem para o cliente; o resto vira 500 genérico, com
 * o detalhe ficando no log do servidor.
 */
export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ZodError) {
    res.status(422).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Dados inválidos na requisição.',
        details: error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      },
    });
    return;
  }

  if (error instanceof DomainError) {
    res.status(STATUS_BY_ERROR.get(error.name) ?? 400).json({
      error: {
        code: error.code,
        message: error.message,
        ...(error instanceof ValidationError && error.details.length > 0
          ? { details: error.details }
          : {}),
      },
    });
    return;
  }

  if (error instanceof QueryFailedError && hasCode(error, PG_UNIQUE_VIOLATION)) {
    res.status(409).json({
      error: { code: 'CONFLICT', message: 'O registro viola uma restrição de unicidade.' },
    });
    return;
  }

  console.error('[unhandled]', error);

  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Erro interno do servidor.',
      ...(isProduction ? {} : { cause: error instanceof Error ? error.message : String(error) }),
    },
  });
};

function hasCode(error: QueryFailedError, code: string): boolean {
  return (error.driverError as { code?: string } | undefined)?.code === code;
}
