import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { env, isProduction } from '../config/env';
import { schemas } from './schemas';

/**
 * Fonte de dados única da aplicação. Também é o arquivo que o CLI do TypeORM lê
 * para rodar as migrations (ver script `typeorm` no package.json).
 *
 * `synchronize` fica desligado em todo ambiente: o schema só muda por migration,
 * versionada junto com o código.
 */
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: env.DB_HOST,
  port: env.DB_PORT,
  username: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  synchronize: false,
  logging: env.DB_LOGGING,
  entities: schemas,
  migrations: [`${__dirname}/migrations/*.{ts,js}`],
  migrationsTableName: 'migrations',
  ...(isProduction ? { ssl: { rejectUnauthorized: false } } : {}),
});
