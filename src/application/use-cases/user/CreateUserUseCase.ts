import { ConflictError, ValidationError } from '../../../domain/errors/DomainError';
import { UserRole } from '../../../domain/enums/UserRole';
import type { UserRepository } from '../../../domain/repositories/UserRepository';
import type { PasswordHasher } from '../../../domain/services/PasswordHasher';
import { isValidCPF, onlyDigits } from '../../../domain/validators/cpf';
import { toUserDTO, type UserDTO } from '../../dtos/UserDTO';

export interface CreateUserInput {
  readonly name: string;
  readonly email: string;
  /** Senha em texto puro — vira hash aqui dentro, antes de qualquer persistência. */
  readonly password: string;
  readonly cpf: string;
  readonly role: UserRole;
  /** Obrigatória para o Agente comunitário; ignorada nos outros perfis. */
  readonly community?: string | null;
}

/** Cadastra um novo usuário do sistema, com a permissão definida pelo administrador (RF5). */
export class CreateUserUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async execute(input: CreateUserInput): Promise<UserDTO> {
    const email = input.email.trim().toLowerCase();
    const cpf = onlyDigits(input.cpf);
    const name = input.name.trim();
    const community = communityFor(input.role, input.community);

    if (!isValidCPF(cpf)) {
      throw new ValidationError('CPF inválido.', [
        { field: 'cpf', message: 'Informe um CPF válido.' },
      ]);
    }

    await this.assertEmailIsAvailable(email);
    await this.assertCpfIsAvailable(cpf);

    const passwordHash = await this.passwordHasher.hash(input.password);

    const user = await this.users.create({
      name,
      email,
      passwordHash,
      cpf,
      role: input.role,
      community,
    });

    return toUserDTO(user);
  }

  private async assertEmailIsAvailable(email: string): Promise<void> {
    const existing = await this.users.findByEmail(email);
    if (existing) {
      throw new ConflictError(`Já existe um usuário cadastrado com o e-mail "${email}".`);
    }
  }

  private async assertCpfIsAvailable(cpf: string): Promise<void> {
    const existing = await this.users.findByCpf(cpf);
    if (existing) {
      throw new ConflictError('Já existe um usuário cadastrado com este CPF.');
    }
  }
}

/** O Agente comunitário precisa de comunidade (RF5 R2); os outros perfis não guardam nenhuma. */
export function communityFor(role: UserRole, community: string | null | undefined): string | null {
  if (role !== UserRole.COMMUNITY_AGENT) return null;

  const trimmed = community?.trim();
  if (!trimmed) {
    throw new ValidationError('Informe a comunidade do agente comunitário.', [
      { field: 'community', message: 'Informe a comunidade do agente comunitário.' },
    ]);
  }
  return trimmed;
}
