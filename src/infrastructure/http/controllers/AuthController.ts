import type { Request, Response } from 'express';
import type { LoginUseCase } from '../../../application/use-cases/auth/LoginUseCase';
import { loginBodySchema } from '../validation/authSchemas';

export class AuthController {
  constructor(private readonly loginUser: LoginUseCase) {}

  login = async (req: Request, res: Response): Promise<void> => {
    const body = loginBodySchema.parse(req.body);
    const session = await this.loginUser.execute(body);

    res.status(200).json({ data: session });
  };
}
