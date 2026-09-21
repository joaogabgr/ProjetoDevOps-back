import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    restoreMocks: true,
    // A app importa `env.ts`, que valida o .env na importação (fail-fast em produção).
    // Os testes não tocam banco de verdade, mas precisam de valores válidos aqui.
    env: {
      NODE_ENV: 'test',
      DB_HOST: 'localhost',
      DB_PORT: '5432',
      DB_USER: 'test',
      DB_PASSWORD: 'test',
      DB_NAME: 'test',
    },
  },
});
