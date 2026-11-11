import type { DataSource } from 'typeorm';
import type { TokenService } from '../domain/services/TokenService';
import { GetCurrentUserUseCase } from '../application/use-cases/auth/GetCurrentUserUseCase';
import { LoginUseCase } from '../application/use-cases/auth/LoginUseCase';
import { CreateStationUseCase } from '../application/use-cases/station/CreateStationUseCase';
import { DeleteStationUseCase } from '../application/use-cases/station/DeleteStationUseCase';
import { GetStationUseCase } from '../application/use-cases/station/GetStationUseCase';
import { ListCommunitiesUseCase } from '../application/use-cases/station/ListCommunitiesUseCase';
import { ListStationsUseCase } from '../application/use-cases/station/ListStationsUseCase';
import { UpdateStationUseCase } from '../application/use-cases/station/UpdateStationUseCase';
import { CreateTypeParameterUseCase } from '../application/use-cases/type-parameter/CreateTypeParameterUseCase';
import { ListTypeParametersUseCase } from '../application/use-cases/type-parameter/ListTypeParametersUseCase';
import { CreateUserUseCase } from '../application/use-cases/user/CreateUserUseCase';
import { DeleteUserUseCase } from '../application/use-cases/user/DeleteUserUseCase';
import { ListUsersUseCase } from '../application/use-cases/user/ListUsersUseCase';
import { UpdateUserUseCase } from '../application/use-cases/user/UpdateUserUseCase';
import { TypeOrmStationRepository } from '../infrastructure/database/repositories/TypeOrmStationRepository';
import { TypeOrmTypeParameterRepository } from '../infrastructure/database/repositories/TypeOrmTypeParameterRepository';
import { TypeOrmUserRepository } from '../infrastructure/database/repositories/TypeOrmUserRepository';
import { env } from '../infrastructure/config/env';
import { AuthController } from '../infrastructure/http/controllers/AuthController';
import { StationController } from '../infrastructure/http/controllers/StationController';
import { TypeParameterController } from '../infrastructure/http/controllers/TypeParameterController';
import { UserController } from '../infrastructure/http/controllers/UserController';
import { BcryptPasswordHasher } from '../infrastructure/security/BcryptPasswordHasher';
import { JwtTokenService } from '../infrastructure/security/JwtTokenService';

export interface Container {
  readonly tokenService: TokenService;
  readonly authController: AuthController;
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
    new ListCommunitiesUseCase(stationRepository),
  );

  const typeParameterController = new TypeParameterController(
    new ListTypeParametersUseCase(typeParameterRepository),
    new CreateTypeParameterUseCase(typeParameterRepository),
  );

  const userRepository = new TypeOrmUserRepository(dataSource);
  const passwordHasher = new BcryptPasswordHasher();
  const userController = new UserController(
    new CreateUserUseCase(userRepository, passwordHasher),
    new UpdateUserUseCase(userRepository),
    new ListUsersUseCase(userRepository),
    new DeleteUserUseCase(userRepository),
  );

  const tokenService = new JwtTokenService(env.JWT_SECRET, env.SESSION_HOURS);
  const authController = new AuthController(
    new LoginUseCase(userRepository, passwordHasher, tokenService),
    new GetCurrentUserUseCase(userRepository),
  );

  return { tokenService, authController, stationController, typeParameterController, userController };
}
