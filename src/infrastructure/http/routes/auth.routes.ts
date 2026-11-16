import { Router, type RequestHandler } from 'express';
import type { AuthController } from '../controllers/AuthController';

export function buildAuthRoutes(controller: AuthController, requireLogin: RequestHandler): Router {
  const router = Router();

  router.post('/login', controller.login);
  router.get('/me', requireLogin, controller.me);

  return router;
}
