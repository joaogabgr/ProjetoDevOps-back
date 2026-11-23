import { Router } from 'express';
import type { Container } from '../../../main/container';
import { env } from '../../config/env';
import { authenticate } from '../middlewares/authenticate';
import { authorize } from '../middlewares/authorize';
import { buildAuthRoutes } from './auth.routes';
import { buildStationRoutes } from './station.routes';
import { buildTypeParameterRoutes } from './typeParameter.routes';
import { buildUserRoutes } from './user.routes';

export function buildRoutes(container: Container): Router {
  const router = Router();

  // Pública. O teste depois de publicar confere aqui se a API alcança o banco
  // e se a versão no ar é a que acabou de ser publicada (SCRUM-251).
  router.get('/health', async (_req, res) => {
    try {
      await container.checkDatabase();
      res.status(200).json({ status: 'ok', db: 'ok', version: env.APP_VERSION, uptime: process.uptime() });
    } catch {
      res.status(503).json({ status: 'erro', db: 'fora', version: env.APP_VERSION });
    }
  });

  const requireLogin = authenticate(container.tokenService);

  router.use('/auth', buildAuthRoutes(container.authController, requireLogin));
  // Daqui para baixo tudo exige login (RF9 R5); cada rota confere o perfil (R6).
  router.use('/stations', requireLogin, buildStationRoutes(container.stationController));
  router.use('/type-parameters', requireLogin, buildTypeParameterRoutes(container.typeParameterController));
  router.use('/users', requireLogin, authorize('MANAGE_USERS'), buildUserRoutes(container.userController));

  return router;
}
