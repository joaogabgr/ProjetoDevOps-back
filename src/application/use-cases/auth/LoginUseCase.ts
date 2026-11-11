import { UnauthorizedError } from '../../../domain/errors/DomainError';
import type { UserRepository } from '../../../domain/repositories/UserRepository';
import type { PasswordHasher } from '../../../domain/services/PasswordHasher';
import type { TokenService } from '../../../domain/services/TokenService';
import { toUserDTO, type UserDTO } from '../../dtos/UserDTO';

export interface LoginInput {
  readonly email: string;
  readonly password: string;
}

export interface LoginOutput {
  readonly token: string;
  readonly expiresAt: string;
  readonly user: UserDTO;
}

/** A mesma mensagem para e-mail inexistente e senha errada, para não revelar quem tem conta. */
export const INVALID_CREDENTIALS = 'E-mail ou senha incorretos.';

/** Entrada no sistema com e-mail e senha (RF9 R1). */
export class LoginUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly tokens: TokenService,
  ) {}

  async execute(input: LoginInput): Promise<LoginOutput> {
    const user = await this.users.findByEmailWithPassword(input.email.trim().toLowerCase());
    if (!user || !(await this.passwordHasher.compare(input.password, user.password))) {
      throw new UnauthorizedError(INVALID_CREDENTIALS);
    }

    const { token, expiresAt } = this.tokens.issue({
      userId: user.id,
      role: user.role,
      community: user.community,
    });

    return { token, expiresAt: expiresAt.toISOString(), user: toUserDTO(user) };
  }
}
