import { Router } from 'express';
import type { Container } from '../../../main/container';
import { authenticate } from '../middlewares/authenticate';
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
  router.use('/stations', buildStationRoutes(container.stationController));
  router.use('/type-parameters', buildTypeParameterRoutes(container.typeParameterController));
  router.use('/users', buildUserRoutes(container.userController));

  return router;
}
