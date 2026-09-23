import type { Express } from 'express';
import { CreateStationUseCase } from '../../src/application/use-cases/station/CreateStationUseCase';
import { DeleteStationUseCase } from '../../src/application/use-cases/station/DeleteStationUseCase';
import { GetStationUseCase } from '../../src/application/use-cases/station/GetStationUseCase';
import { ListStationsUseCase } from '../../src/application/use-cases/station/ListStationsUseCase';
import { UpdateStationUseCase } from '../../src/application/use-cases/station/UpdateStationUseCase';
import { ListTypeParametersUseCase } from '../../src/application/use-cases/type-parameter/ListTypeParametersUseCase';
import { CreateUserUseCase } from '../../src/application/use-cases/user/CreateUserUseCase';
import { createApp } from '../../src/infrastructure/http/app';
import { StationController } from '../../src/infrastructure/http/controllers/StationController';
import { TypeParameterController } from '../../src/infrastructure/http/controllers/TypeParameterController';
import { UserController } from '../../src/infrastructure/http/controllers/UserController';
import type { Container } from '../../src/main/container';
import { FakePasswordHasher } from '../fakes/FakePasswordHasher';
import { InMemoryStationRepository } from '../fakes/InMemoryStationRepository';
import { InMemoryTypeParameterRepository } from '../fakes/InMemoryTypeParameterRepository';
import { InMemoryUserRepository } from '../fakes/InMemoryUserRepository';

/**
 * Monta a app Express com repositórios em memória — mesmo composition root de
 * `main/container.ts`, mas trocando os adaptadores TypeORM pelos fakes de teste.
 */
export function buildTestApp(
  stationRepository = new InMemoryStationRepository(),
  userRepository = new InMemoryUserRepository(),
): {
  app: Express;
  stationRepository: InMemoryStationRepository;
  userRepository: InMemoryUserRepository;
} {
  const typeParameterRepository = new InMemoryTypeParameterRepository();

  const container: Container = {
    stationController: new StationController(
      new CreateStationUseCase(stationRepository, typeParameterRepository),
      new ListStationsUseCase(stationRepository),
      new GetStationUseCase(stationRepository),
      new UpdateStationUseCase(stationRepository),
      new DeleteStationUseCase(stationRepository),
    ),
    typeParameterController: new TypeParameterController(
      new ListTypeParametersUseCase(typeParameterRepository),
    ),
    userController: new UserController(
      new CreateUserUseCase(userRepository, new FakePasswordHasher()),
    ),
  };

  return { app: createApp(container), stationRepository, userRepository };
}
