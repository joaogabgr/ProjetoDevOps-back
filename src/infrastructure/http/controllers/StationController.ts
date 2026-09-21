import type { Request, Response } from 'express';
import type { CreateStationUseCase } from '../../../application/use-cases/station/CreateStationUseCase';
import type { DeleteStationUseCase } from '../../../application/use-cases/station/DeleteStationUseCase';
import type { GetStationUseCase } from '../../../application/use-cases/station/GetStationUseCase';
import type { ListStationsUseCase } from '../../../application/use-cases/station/ListStationsUseCase';
import type { UpdateStationUseCase } from '../../../application/use-cases/station/UpdateStationUseCase';
import {
  createStationBodySchema,
  listStationsQuerySchema,
  stationIdParamsSchema,
  updateStationBodySchema,
} from '../validation/stationSchemas';

/**
 * Traduz HTTP para caso de uso e de volta.
 *
 * Nenhuma regra de negócio mora aqui — só parsing da requisição e escolha do status.
 * Os `throw` do Zod e dos casos de uso sobem para o `errorHandler` (Express 5 já
 * encaminha rejeições de handlers assíncronos).
 */
export class StationController {
  constructor(
    private readonly createStation: CreateStationUseCase,
    private readonly listStations: ListStationsUseCase,
    private readonly getStation: GetStationUseCase,
    private readonly updateStation: UpdateStationUseCase,
    private readonly deleteStation: DeleteStationUseCase,
  ) {}

  create = async (req: Request, res: Response): Promise<void> => {
    const body = createStationBodySchema.parse(req.body);
    const station = await this.createStation.execute(body);

    res.status(201).location(`/api/stations/${station.id}`).json({ data: station });
  };

  list = async (req: Request, res: Response): Promise<void> => {
    const query = listStationsQuerySchema.parse(req.query);
    const result = await this.listStations.execute(query);

    res.status(200).json({
      data: result.items,
      meta: { total: result.total, page: result.page, perPage: result.perPage },
    });
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    const { id } = stationIdParamsSchema.parse(req.params);
    const station = await this.getStation.execute(id);

    res.status(200).json({ data: station });
  };

  update = async (req: Request, res: Response): Promise<void> => {
    const { id } = stationIdParamsSchema.parse(req.params);
    const body = updateStationBodySchema.parse(req.body);
    const station = await this.updateStation.execute(id, body);

    res.status(200).json({ data: station });
  };

  remove = async (req: Request, res: Response): Promise<void> => {
    const { id } = stationIdParamsSchema.parse(req.params);
    await this.deleteStation.execute(id);

    res.status(204).send();
  };
}
