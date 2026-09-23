import { ConflictError, NotFoundError } from '../../../domain/errors/DomainError';
import type { UserRole } from '../../../domain/enums/UserRole';
import type { UserRepository } from '../../../domain/repositories/UserRepository';
import { toUserDTO, type UserDTO } from '../../dtos/UserDTO';

export interface UpdateUserInput {
  readonly name?: string;
  readonly email?: string;
  readonly role?: UserRole;
  readonly active?: boolean;
}

/**
 * Edita os dados cadastrais de um usuário, incluindo a permissão (RF5).
 *
 * `cpf` e `password` não são editáveis por aqui — ver `UpdateUserData` no domínio.
 */
export class UpdateUserUseCase {
  constructor(private readonly users: UserRepository) {}

  async execute(id: string, input: UpdateUserInput): Promise<UserDTO> {
    const current = await this.users.findById(id);
    if (!current) {
      throw new NotFoundError('Usuário', id);
    }

    const email = input.email ? input.email.trim().toLowerCase() : undefined;

    if (email && email !== current.email) {
      await this.assertEmailIsAvailable(email);
    }

    const updated = await this.users.update(id, {
      ...(input.name !== undefined ? { name: input.name.trim() } : {}),
      ...(email !== undefined ? { email } : {}),
      ...(input.role !== undefined ? { role: input.role } : {}),
      ...(input.active !== undefined ? { active: input.active } : {}),
    });

    return toUserDTO(updated);
  }

  private async assertEmailIsAvailable(email: string): Promise<void> {
    const existing = await this.users.findByEmail(email);
    if (existing) {
      throw new ConflictError(`Já existe um usuário cadastrado com o e-mail "${email}".`);
    }
  }
}
