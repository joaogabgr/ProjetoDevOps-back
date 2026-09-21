import { Router } from 'express';
import type { TypeParameterController } from '../controllers/TypeParameterController';

export function buildTypeParameterRoutes(controller: TypeParameterController): Router {
  const router = Router();

  router.get('/', controller.list);

  return router;
}
