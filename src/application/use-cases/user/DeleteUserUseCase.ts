import { ConflictError, NotFoundError } from '../../../domain/errors/DomainError';
import type { UserRepository } from '../../../domain/repositories/UserRepository';

/** Exclui um usuário que saiu do projeto (RF5). O último administrador ativo nunca é excluído. */
export class DeleteUserUseCase {
  constructor(private readonly users: UserRepository) {}

  async execute(id: string): Promise<void> {
    const user = await this.users.findById(id);
    if (!user) {
      throw new NotFoundError('Usuário', id);
    }

    if (user.isAdmin() && user.active && (await this.users.countActiveAdmins()) <= 1) {
      throw new ConflictError('Não é possível excluir o último administrador ativo.');
    }

    await this.users.delete(id);
  }
}
