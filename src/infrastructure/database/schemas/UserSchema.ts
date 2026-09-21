import { EntitySchema } from 'typeorm';
import { User } from '../../../domain/entities/User';
import { USER_ROLES } from '../../../domain/enums/UserRole';

/**
 * Mapeamento ORM da entidade `User`.
 *
 * Usamos `EntitySchema` em vez de decorators para que as entidades de domínio
 * continuem sem nenhuma referência a TypeORM.
 */
export const UserSchema = new EntitySchema<User>({
  name: 'User',
  tableName: 'users',
  target: User,
  columns: {
    id: { type: 'uuid', primary: true, generated: 'uuid' },
    name: { type: 'varchar', length: 255 },
    email: { type: 'varchar', length: 255, unique: true },
    password: { type: 'varchar', length: 255, select: false },
    role: { type: 'enum', enum: USER_ROLES, enumName: 'user_role' },
    cpf: { type: 'char', length: 11, unique: true },
    createdAt: { name: 'created_at', type: 'timestamptz', createDate: true },
    active: { type: 'boolean', default: true },
  },
  indices: [{ name: 'idx_users_role', columns: ['role'] }],
});
