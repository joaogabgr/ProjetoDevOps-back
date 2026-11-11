import { Router } from 'express';
import type { TypeParameterController } from '../controllers/TypeParameterController';
import { authorize } from '../middlewares/authorize';

export function buildTypeParameterRoutes(controller: TypeParameterController): Router {
  const router = Router();

  router.get('/', authorize('VIEW_STATIONS'), controller.list);
  router.post('/', authorize('MANAGE_STATIONS'), controller.create);
  router.patch('/:id', authorize('MANAGE_STATIONS'), controller.update);
  router.delete('/:id', authorize('MANAGE_STATIONS'), controller.remove);

  return router;
}
