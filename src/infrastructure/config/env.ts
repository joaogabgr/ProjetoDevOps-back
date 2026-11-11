import 'dotenv/config';
import { z } from 'zod';

/**
 * Validação da configuração na inicialização: se faltar variável, o processo morre
 * aqui e não no meio de uma requisição.
 */
/** Só para desenvolvimento e teste; produção recusa subir com ele. */
const DEV_JWT_SECRET = 'segredo-de-desenvolvimento-troque-em-producao';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),

  DB_HOST: z.string().min(1),
  DB_PORT: z.coerce.number().int().positive().default(5432),
  DB_USER: z.string().min(1),
  DB_PASSWORD: z.string(),
  DB_NAME: z.string().min(1),
  /** Segredo que assina o token da sessão. */
  JWT_SECRET: z.string().min(32, 'JWT_SECRET precisa de ao menos 32 caracteres.').default(DEV_JWT_SECRET),
  /** Validade da sessão em horas (RF9 R3). */
  SESSION_HOURS: z.coerce.number().positive().default(8),

  DB_LOGGING: z
    .enum(['true', 'false'])
    .default('false')
    .transform((value) => value === 'true'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues.map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`);
  throw new Error(`Configuração inválida (.env):\n${issues.join('\n')}`);
}

if (parsed.data.NODE_ENV === 'production' && parsed.data.JWT_SECRET === DEV_JWT_SECRET) {
  throw new Error('Configuração inválida (.env):\n  - JWT_SECRET: defina um segredo próprio em produção.');
}

export const env = Object.freeze(parsed.data);

export const isProduction = env.NODE_ENV === 'production';
