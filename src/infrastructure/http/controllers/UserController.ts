import type { Request, Response } from 'express';
import type { CreateUserUseCase } from '../../../application/use-cases/user/CreateUserUseCase';
import type { UpdateUserUseCase } from '../../../application/use-cases/user/UpdateUserUseCase';
import {
  createUserBodySchema,
  updateUserBodySchema,
  userIdParamsSchema,
} from '../validation/userSchemas';

export class UserController {
  constructor(
    private readonly createUser: CreateUserUseCase,
    private readonly updateUser: UpdateUserUseCase,
  ) {}

  create = async (req: Request, res: Response): Promise<void> => {
    const body = createUserBodySchema.parse(req.body);
    const user = await this.createUser.execute(body);

    res.status(201).location(`/api/users/${user.id}`).json({ data: user });
  };

  update = async (req: Request, res: Response): Promise<void> => {
    const { id } = userIdParamsSchema.parse(req.params);
    const body = updateUserBodySchema.parse(req.body);
    const user = await this.updateUser.execute(id, body);

    res.status(200).json({ data: user });
  };
}
