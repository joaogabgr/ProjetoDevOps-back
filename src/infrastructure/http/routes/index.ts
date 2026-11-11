import { Router } from 'express';
import type { Container } from '../../../main/container';
import { authenticate } from '../middlewares/authenticate';
import { authorize } from '../middlewares/authorize';
import { buildAuthRoutes } from './auth.routes';
import { buildStationRoutes } from './station.routes';
import { buildTypeParameterRoutes } from './typeParameter.routes';
import { buildUserRoutes } from './user.routes';

export function buildRoutes(container: Container): Router {
  const router = Router();

  router.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok', uptime: process.uptime() });
  });

  const requireLogin = authenticate(container.tokenService);

  router.use('/auth', buildAuthRoutes(container.authController, requireLogin));
  // Daqui para baixo tudo exige login (RF9 R5); cada rota confere o perfil (R6).
  router.use('/stations', requireLogin, buildStationRoutes(container.stationController));
  router.use('/type-parameters', requireLogin, buildTypeParameterRoutes(container.typeParameterController));
  router.use('/users', requireLogin, authorize('MANAGE_USERS'), buildUserRoutes(container.userController));

  return router;
}
