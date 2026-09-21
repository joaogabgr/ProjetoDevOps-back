import 'dotenv/config';
import { z } from 'zod';

/**
 * Validação da configuração na inicialização: se faltar variável, o processo morre
 * aqui e não no meio de uma requisição.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),

  DB_HOST: z.string().min(1),
  DB_PORT: z.coerce.number().int().positive().default(5432),
  DB_USER: z.string().min(1),
  DB_PASSWORD: z.string(),
  DB_NAME: z.string().min(1),
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

export const env = Object.freeze(parsed.data);

export const isProduction = env.NODE_ENV === 'production';
