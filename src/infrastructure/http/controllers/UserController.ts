import type { Request, Response } from 'express';
import type { CreateUserUseCase } from '../../../application/use-cases/user/CreateUserUseCase';
import { createUserBodySchema } from '../validation/userSchemas';

export class UserController {
  constructor(private readonly createUser: CreateUserUseCase) {}

  create = async (req: Request, res: Response): Promise<void> => {
    const body = createUserBodySchema.parse(req.body);
    const user = await this.createUser.execute(body);

    res.status(201).location(`/api/users/${user.id}`).json({ data: user });
  };
}
