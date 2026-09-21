import 'reflect-metadata';
import type { Server } from 'node:http';
import { buildContainer } from '../../main/container';
import { env } from '../config/env';
import { AppDataSource } from '../database/data-source';
import { createApp } from './app';

async function bootstrap(): Promise<void> {
  await AppDataSource.initialize();
  console.log(`[db] conectado em ${env.DB_HOST}:${env.DB_PORT}/${env.DB_NAME}`);

  const app = createApp(buildContainer(AppDataSource));
  const server = app.listen(env.PORT, () => {
    console.log(`[http] ouvindo em http://localhost:${env.PORT}/api (${env.NODE_ENV})`);
  });

  registerShutdown(server);
}

/** Encerra conexões abertas antes de sair, para não derrubar requisição em andamento. */
function registerShutdown(server: Server): void {
  const shutdown = (signal: string) => async () => {
    console.log(`[http] ${signal} recebido, encerrando...`);

    server.close(async () => {
      if (AppDataSource.isInitialized) {
        await AppDataSource.destroy();
      }
      process.exit(0);
    });
  };

  process.once('SIGINT', shutdown('SIGINT'));
  process.once('SIGTERM', shutdown('SIGTERM'));
}

bootstrap().catch((error) => {
  console.error('[boot] falha ao iniciar a aplicação:', error);
  process.exit(1);
});
