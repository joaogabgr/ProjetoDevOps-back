import type { Request, Response } from 'express';
import type { ListTypeParametersUseCase } from '../../../application/use-cases/type-parameter/ListTypeParametersUseCase';

export class TypeParameterController {
  constructor(private readonly listTypeParameters: ListTypeParametersUseCase) {}

  list = async (_req: Request, res: Response): Promise<void> => {
    const items = await this.listTypeParameters.execute();
    res.status(200).json({ data: items });
  };
}
