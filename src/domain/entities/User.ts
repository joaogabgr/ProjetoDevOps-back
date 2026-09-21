import { UserRole } from '../enums/UserRole';

/** Usuário do sistema (RF5/RF9). */
export class User {
  id!: string;
  name!: string;
  email!: string;
  /** Sempre o hash — a senha em texto puro nunca chega até aqui. */
  password!: string;
  role!: UserRole;
  cpf!: string;
  createdAt!: Date;
  active!: boolean;

  isAdmin(): boolean {
    return this.role === UserRole.ADMIN;
  }

  canOperate(): boolean {
    return this.active && (this.role === UserRole.ADMIN || this.role === UserRole.EMPLOYEE);
  }
}
