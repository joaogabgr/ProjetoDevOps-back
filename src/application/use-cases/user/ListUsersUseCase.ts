import type { UserRole } from '../../../domain/enums/UserRole';
import type { Paginated } from '../../../domain/repositories/StationRepository';
import type { UserRepository } from '../../../domain/repositories/UserRepository';
import { toUserDTO, type UserDTO } from '../../dtos/UserDTO';

export interface ListUsersInput {
  readonly page: number;
  readonly perPage: number;
  readonly role?: UserRole;
  readonly name?: string;
}

/** Lista os usuários para o administrador conferir quem tem acesso (RF5). */
export class ListUsersUseCase {
  constructor(private readonly users: UserRepository) {}

  async execute(input: ListUsersInput): Promise<Paginated<UserDTO>> {
    const result = await this.users.list(input);

    return {
      items: result.items.map(toUserDTO),
      total: result.total,
      page: result.page,
      perPage: result.perPage,
    };
  }
}
