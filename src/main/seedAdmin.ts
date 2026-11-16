import 'reflect-metadata';
import { CreateUserUseCase } from '../application/use-cases/user/CreateUserUseCase';
import { UserRole } from '../domain/enums/UserRole';
import { AppDataSource } from '../infrastructure/database/data-source';
import { TypeOrmUserRepository } from '../infrastructure/database/repositories/TypeOrmUserRepository';
import { BcryptPasswordHasher } from '../infrastructure/security/BcryptPasswordHasher';

/**
 * Cria o primeiro Administrador quando ainda não existe nenhum ativo.
 *
 * Com o login obrigatório (RF9), sem este passo ninguém entraria para cadastrar o resto.
 * Uso: ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD e ADMIN_CPF no ambiente e `npm run seed:admin`.
 */
async function seedAdmin(): Promise<void> {
  const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_CPF } = process.env;
  if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD || !ADMIN_CPF) {
    throw new Error('Defina ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD e ADMIN_CPF.');
  }

  await AppDataSource.initialize();
  try {
    const users = new TypeOrmUserRepository(AppDataSource);
    if ((await users.countActiveAdmins()) > 0) {
      console.log('[seed] já existe administrador ativo; nada a fazer.');
      return;
    }

    const admin = await new CreateUserUseCase(users, new BcryptPasswordHasher()).execute({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      cpf: ADMIN_CPF,
      role: UserRole.ADMIN,
    });
    console.log(`[seed] administrador criado: ${admin.email}`);
  } finally {
    await AppDataSource.destroy();
  }
}

seedAdmin().catch((error) => {
  console.error('[seed] falhou:', error instanceof Error ? error.message : error);
  process.exit(1);
});
