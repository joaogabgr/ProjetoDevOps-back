import type { Request, Response } from 'express';
import type { CreateTypeParameterUseCase } from '../../../application/use-cases/type-parameter/CreateTypeParameterUseCase';
import type { DeleteTypeParameterUseCase } from '../../../application/use-cases/type-parameter/DeleteTypeParameterUseCase';
import type { ListTypeParametersUseCase } from '../../../application/use-cases/type-parameter/ListTypeParametersUseCase';
import type { UpdateTypeParameterUseCase } from '../../../application/use-cases/type-parameter/UpdateTypeParameterUseCase';
import {
  createTypeParameterBodySchema,
  typeParameterIdParamsSchema,
  updateTypeParameterBodySchema,
} from '../validation/typeParameterSchemas';

export class TypeParameterController {
  constructor(
    private readonly listTypeParameters: ListTypeParametersUseCase,
    private readonly createTypeParameter: CreateTypeParameterUseCase,
    private readonly updateTypeParameter: UpdateTypeParameterUseCase,
    private readonly deleteTypeParameter: DeleteTypeParameterUseCase,
  ) {}

  list = async (_req: Request, res: Response): Promise<void> => {
    const items = await this.listTypeParameters.execute();
    res.status(200).json({ data: items });
  };

  create = async (req: Request, res: Response): Promise<void> => {
    const body = createTypeParameterBodySchema.parse(req.body);
    const typeParameter = await this.createTypeParameter.execute(body);

    res.status(201).location(`/api/type-parameters/${typeParameter.id}`).json({ data: typeParameter });
  };

  update = async (req: Request, res: Response): Promise<void> => {
    const { id } = typeParameterIdParamsSchema.parse(req.params);
    const body = updateTypeParameterBodySchema.parse(req.body);
    const typeParameter = await this.updateTypeParameter.execute(id, body);

    res.status(200).json({ data: typeParameter });
  };

  remove = async (req: Request, res: Response): Promise<void> => {
    const { id } = typeParameterIdParamsSchema.parse(req.params);
    await this.deleteTypeParameter.execute(id);

    res.status(204).send();
  };
}
