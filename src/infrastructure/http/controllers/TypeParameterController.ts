import type { Request, Response } from 'express';
import type { CreateTypeParameterUseCase } from '../../../application/use-cases/type-parameter/CreateTypeParameterUseCase';
import type { ListTypeParametersUseCase } from '../../../application/use-cases/type-parameter/ListTypeParametersUseCase';
import { createTypeParameterBodySchema } from '../validation/typeParameterSchemas';

export class TypeParameterController {
  constructor(
    private readonly listTypeParameters: ListTypeParametersUseCase,
    private readonly createTypeParameter: CreateTypeParameterUseCase,
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
}
