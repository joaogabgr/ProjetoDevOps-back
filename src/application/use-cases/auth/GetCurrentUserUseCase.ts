import { UnauthorizedError } from '../../../domain/errors/DomainError';
import type { UserRepository } from '../../../domain/repositories/UserRepository';
import { toUserDTO, type UserDTO } from '../../dtos/UserDTO';

/**
 * Dados de quem está logado, usados pelo front ao abrir o sistema.
 *
 * Se o usuário foi excluído ou desativado depois do login, a sessão deixa de valer.
 */
export class GetCurrentUserUseCase {
  constructor(private readonly users: UserRepository) {}

  async execute(userId: string): Promise<UserDTO> {
    const user = await this.users.findById(userId);
    if (!user || !user.active) {
      throw new UnauthorizedError('Sessão inválida. Entre novamente.');
    }
    return toUserDTO(user);
  }
}
