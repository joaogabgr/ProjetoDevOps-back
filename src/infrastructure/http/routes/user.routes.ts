import { Router } from 'express';
import type { UserController } from '../controllers/UserController';

export function buildUserRoutes(controller: UserController): Router {
  const router = Router();

  router.post('/', controller.create);

  return router;
}
