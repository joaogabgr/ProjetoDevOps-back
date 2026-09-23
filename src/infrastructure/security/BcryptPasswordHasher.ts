import bcrypt from 'bcryptjs';
import type { PasswordHasher } from '../../domain/services/PasswordHasher';

/** bcrypt trunca silenciosamente senhas acima de 72 bytes; validamos isso na entrada HTTP. */
const SALT_ROUNDS = 10;

export class BcryptPasswordHasher implements PasswordHasher {
  async hash(plainPassword: string): Promise<string> {
    return bcrypt.hash(plainPassword, SALT_ROUNDS);
  }

  async compare(plainPassword: string, passwordHash: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, passwordHash);
  }
}
