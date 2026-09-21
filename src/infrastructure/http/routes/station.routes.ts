import { Router } from 'express';
import type { StationController } from '../controllers/StationController';

export function buildStationRoutes(controller: StationController): Router {
  const router = Router();

  router.post('/', controller.create);
  router.get('/', controller.list);
  router.get('/:id', controller.getById);
  router.patch('/:id', controller.update);
  router.delete('/:id', controller.remove);

  return router;
}
