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
  /** Só o Agente comunitário tem comunidade; os outros perfis veem todas (RF9). */
  community!: string | null;
  createdAt!: Date;
  active!: boolean;

  isAdmin(): boolean {
    return this.role === UserRole.ADMIN;
  }

  isCommunityAgent(): boolean {
    return this.role === UserRole.COMMUNITY_AGENT;
  }

  canOperate(): boolean {
    return this.active && (this.role === UserRole.ADMIN || this.role === UserRole.TECHNICIAN);
  }
}
