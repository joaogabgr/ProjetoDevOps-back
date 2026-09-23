import type { User } from '../../domain/entities/User';
import type { UserRole } from '../../domain/enums/UserRole';

/** Representação do usuário exposta pela API — nunca inclui a senha, nem o hash. */
export interface UserDTO {
  id: string;
  name: string;
  email: string;
  cpf: string;
  role: UserRole;
  createdAt: string;
  active: boolean;
}

export function toUserDTO(user: User): UserDTO {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    cpf: user.cpf,
    role: user.role,
    createdAt: user.createdAt.toISOString(),
    active: user.active,
  };
}
