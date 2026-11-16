import type { Request, Response } from 'express';
import type { GetCurrentUserUseCase } from '../../../application/use-cases/auth/GetCurrentUserUseCase';
import type { LoginUseCase } from '../../../application/use-cases/auth/LoginUseCase';
import { currentSession } from '../middlewares/authenticate';
import { loginBodySchema } from '../validation/authSchemas';

export class AuthController {
  constructor(
    private readonly loginUser: LoginUseCase,
    private readonly getCurrentUser: GetCurrentUserUseCase,
  ) {}

  login = async (req: Request, res: Response): Promise<void> => {
    const body = loginBodySchema.parse(req.body);
    const session = await this.loginUser.execute(body);

    res.status(200).json({ data: session });
  };

  me = async (req: Request, res: Response): Promise<void> => {
    const user = await this.getCurrentUser.execute(currentSession(req.auth).userId);

    res.status(200).json({ data: user });
  };
}
