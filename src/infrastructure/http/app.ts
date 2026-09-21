import express, { type Express } from 'express';
import type { Container } from '../../main/container';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler';
import { buildRoutes } from './routes';

/**
 * Monta a aplicação Express a partir do container já resolvido.
 *
 * Separado do `server.ts` para que testes de integração possam levantar a app
 * sem abrir uma porta.
 */
export function createApp(container: Container): Express {
  const app = express();

  app.disable('x-powered-by');
  app.use(express.json({ limit: '1mb' }));

  app.use('/api', buildRoutes(container));

  // Sempre por último: 404 para rota desconhecida, e o tratador de erros no fim da pilha.
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
