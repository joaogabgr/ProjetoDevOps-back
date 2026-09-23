import type { User } from '../entities/User';
import type { UserRole } from '../enums/UserRole';

export interface CreateUserData {
  readonly name: string;
  readonly email: string;
  /** Já deve chegar como hash — o repositório nunca vê a senha em texto puro. */
  readonly passwordHash: string;
  readonly cpf: string;
  readonly role: UserRole;
}

/**
 * Campos editáveis de um usuário (RF5 — editar usuário).
 *
 * `cpf` fica de fora de propósito: é documento de identidade, não um dado
 * cadastral que se "corrige" por aqui. `password` também não entra — troca de
 * senha é um fluxo à parte (RF5 — alterar senha), com suas próprias regras.
 */
export interface UpdateUserData {
  readonly name?: string;
  readonly email?: string;
  readonly role?: UserRole;
  readonly active?: boolean;
}

/**
 * Porta de persistência de usuários.
 *
 * Como em `StationRepository`, fica no domínio para que os casos de uso não
 * conheçam TypeORM. `findByEmail`/`findByCpf` existem para as checagens de
 * unicidade do cadastro (RF5).
 */
export interface UserRepository {
  create(data: CreateUserData): Promise<User>;
  update(id: string, data: UpdateUserData): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByCpf(cpf: string): Promise<User | null>;
}
