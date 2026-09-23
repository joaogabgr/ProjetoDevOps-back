import type { DataSource } from 'typeorm';
import { CreateStationUseCase } from '../application/use-cases/station/CreateStationUseCase';
import { DeleteStationUseCase } from '../application/use-cases/station/DeleteStationUseCase';
import { GetStationUseCase } from '../application/use-cases/station/GetStationUseCase';
import { ListStationsUseCase } from '../application/use-cases/station/ListStationsUseCase';
import { UpdateStationUseCase } from '../application/use-cases/station/UpdateStationUseCase';
import { ListTypeParametersUseCase } from '../application/use-cases/type-parameter/ListTypeParametersUseCase';
import { CreateUserUseCase } from '../application/use-cases/user/CreateUserUseCase';
import { TypeOrmStationRepository } from '../infrastructure/database/repositories/TypeOrmStationRepository';
import { TypeOrmTypeParameterRepository } from '../infrastructure/database/repositories/TypeOrmTypeParameterRepository';
import { TypeOrmUserRepository } from '../infrastructure/database/repositories/TypeOrmUserRepository';
import { StationController } from '../infrastructure/http/controllers/StationController';
import { TypeParameterController } from '../infrastructure/http/controllers/TypeParameterController';
import { UserController } from '../infrastructure/http/controllers/UserController';
import { BcryptPasswordHasher } from '../infrastructure/security/BcryptPasswordHasher';

export interface Container {
  readonly stationController: StationController;
  readonly typeParameterController: TypeParameterController;
  readonly userController: UserController;
}

/**
 * Composition root: o único lugar que conhece as implementações concretas.
 *
 * É aqui que as portas do domínio recebem os adaptadores TypeORM; trocar de ORM
 * ou injetar um repositório fake em teste significa mexer só neste arquivo.
 */
export function buildContainer(dataSource: DataSource): Container {
  const stationRepository = new TypeOrmStationRepository(dataSource);
  const typeParameterRepository = new TypeOrmTypeParameterRepository(dataSource);

  const stationController = new StationController(
    new CreateStationUseCase(stationRepository, typeParameterRepository),
    new ListStationsUseCase(stationRepository),
    new GetStationUseCase(stationRepository),
    new UpdateStationUseCase(stationRepository),
    new DeleteStationUseCase(stationRepository),
  );

  const typeParameterController = new TypeParameterController(
    new ListTypeParametersUseCase(typeParameterRepository),
  );

  const userRepository = new TypeOrmUserRepository(dataSource);
  const passwordHasher = new BcryptPasswordHasher();
  const userController = new UserController(new CreateUserUseCase(userRepository, passwordHasher));

  return { stationController, typeParameterController, userController };
}
