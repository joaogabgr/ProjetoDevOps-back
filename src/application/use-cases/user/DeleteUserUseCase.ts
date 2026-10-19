import { NotFoundError } from '../../../domain/errors/DomainError';
import type { UserRepository } from '../../../domain/repositories/UserRepository';

/** Exclui um usuário que saiu do projeto (RF5). */
export class DeleteUserUseCase {
  constructor(private readonly users: UserRepository) {}

  async execute(id: string): Promise<void> {
    const user = await this.users.findById(id);
    if (!user) {
      throw new NotFoundError('Usuário', id);
    }

    await this.users.delete(id);
  }
}
