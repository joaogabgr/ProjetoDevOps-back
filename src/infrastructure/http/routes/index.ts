import { Router } from 'express';
import type { Container } from '../../../main/container';
import { buildStationRoutes } from './station.routes';
import { buildTypeParameterRoutes } from './typeParameter.routes';

export function buildRoutes(container: Container): Router {
  const router = Router();

  router.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok', uptime: process.uptime() });
  });

  router.use('/stations', buildStationRoutes(container.stationController));
  router.use('/type-parameters', buildTypeParameterRoutes(container.typeParameterController));

  return router;
}
