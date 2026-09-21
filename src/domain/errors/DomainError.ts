/**
 * Erro esperado de regra de negócio.
 *
 * O domínio não conhece HTTP: ele descreve *o que* aconteceu através de um `code`,
 * e a camada HTTP decide o status. Qualquer erro que não seja um `DomainError`
 * é tratado como falha inesperada (500).
 */
export abstract class DomainError extends Error {
  abstract readonly code: string;

  protected constructor(message: string) {
    super(message);
    this.name = new.target.name;
    Error.captureStackTrace?.(this, new.target);
  }
}

/** O recurso pedido não existe. */
export class NotFoundError extends DomainError {
  readonly code = 'NOT_FOUND';

  constructor(resource: string, identifier: string) {
    super(`${resource} não encontrado(a) para o identificador "${identifier}".`);
  }
}

/** A operação viola uma restrição de unicidade ou de estado. */
export class ConflictError extends DomainError {
  readonly code = 'CONFLICT';

  constructor(message: string) {
    super(message);
  }
}

/** Os dados recebidos não satisfazem uma regra de negócio. */
export class ValidationError extends DomainError {
  readonly code = 'VALIDATION_ERROR';

  constructor(
    message: string,
    readonly details: ReadonlyArray<{ field: string; message: string }> = [],
  ) {
    super(message);
  }
}
