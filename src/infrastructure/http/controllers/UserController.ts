import type { Request, Response } from 'express';
import type { CreateUserUseCase } from '../../../application/use-cases/user/CreateUserUseCase';
import type { ListUsersUseCase } from '../../../application/use-cases/user/ListUsersUseCase';
import type { UpdateUserUseCase } from '../../../application/use-cases/user/UpdateUserUseCase';
import {
  createUserBodySchema,
  listUsersQuerySchema,
  updateUserBodySchema,
  userIdParamsSchema,
} from '../validation/userSchemas';

export class UserController {
  constructor(
    private readonly createUser: CreateUserUseCase,
    private readonly updateUser: UpdateUserUseCase,
    private readonly listUsers: ListUsersUseCase,
  ) {}

  create = async (req: Request, res: Response): Promise<void> => {
    const body = createUserBodySchema.parse(req.body);
    const user = await this.createUser.execute(body);

    res.status(201).location(`/api/users/${user.id}`).json({ data: user });
  };

  list = async (req: Request, res: Response): Promise<void> => {
    const query = listUsersQuerySchema.parse(req.query);
    const result = await this.listUsers.execute(query);
    const totalPages = result.total === 0 ? 0 : Math.ceil(result.total / result.perPage);

    res.status(200).json({
      data: result.items,
      meta: { total: result.total, page: result.page, perPage: result.perPage, totalPages },
    });
  };

  update = async (req: Request, res: Response): Promise<void> => {
    const { id } = userIdParamsSchema.parse(req.params);
    const body = updateUserBodySchema.parse(req.body);
    const user = await this.updateUser.execute(id, body);

    res.status(200).json({ data: user });
  };
}
