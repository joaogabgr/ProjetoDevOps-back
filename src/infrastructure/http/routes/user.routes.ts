import { Router } from 'express';
import type { UserController } from '../controllers/UserController';

export function buildUserRoutes(controller: UserController): Router {
  const router = Router();

  router.get('/', controller.list);
  router.post('/', controller.create);
  router.patch('/:id', controller.update);
  router.delete('/:id', controller.remove);

  return router;
}
