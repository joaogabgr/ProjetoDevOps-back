import { Router } from 'express';
import type { StationController } from '../controllers/StationController';
import { authorize } from '../middlewares/authorize';

export function buildStationRoutes(controller: StationController): Router {
  const router = Router();
  const view = authorize('VIEW_STATIONS');
  const manage = authorize('MANAGE_STATIONS');

  router.post('/', manage, controller.create);
  router.get('/', view, controller.list);
  // Antes de '/:id', senão "communities" seria lido como id.
  router.get('/communities', view, controller.communities);
  router.get('/:id', view, controller.getById);
  router.patch('/:id', manage, controller.update);
  router.patch('/:id/status', manage, controller.changeStatus);
  router.delete('/:id', manage, controller.remove);

  return router;
}
