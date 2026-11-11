import { randomUUID } from 'node:crypto';
import type { Express } from 'express';
import { GetCurrentUserUseCase } from '../../src/application/use-cases/auth/GetCurrentUserUseCase';
import { LoginUseCase } from '../../src/application/use-cases/auth/LoginUseCase';
import { CreateStationUseCase } from '../../src/application/use-cases/station/CreateStationUseCase';
import { DeleteStationUseCase } from '../../src/application/use-cases/station/DeleteStationUseCase';
import { GetStationUseCase } from '../../src/application/use-cases/station/GetStationUseCase';
import { ListCommunitiesUseCase } from '../../src/application/use-cases/station/ListCommunitiesUseCase';
import { ListStationsUseCase } from '../../src/application/use-cases/station/ListStationsUseCase';
import { UpdateStationUseCase } from '../../src/application/use-cases/station/UpdateStationUseCase';
import { CreateTypeParameterUseCase } from '../../src/application/use-cases/type-parameter/CreateTypeParameterUseCase';
import { DeleteTypeParameterUseCase } from '../../src/application/use-cases/type-parameter/DeleteTypeParameterUseCase';
import { ListTypeParametersUseCase } from '../../src/application/use-cases/type-parameter/ListTypeParametersUseCase';
import { UpdateTypeParameterUseCase } from '../../src/application/use-cases/type-parameter/UpdateTypeParameterUseCase';
import { CreateUserUseCase } from '../../src/application/use-cases/user/CreateUserUseCase';
import { DeleteUserUseCase } from '../../src/application/use-cases/user/DeleteUserUseCase';
import { ListUsersUseCase } from '../../src/application/use-cases/user/ListUsersUseCase';
import { UpdateUserUseCase } from '../../src/application/use-cases/user/UpdateUserUseCase';
import { createApp } from '../../src/infrastructure/http/app';
import { AuthController } from '../../src/infrastructure/http/controllers/AuthController';
import { StationController } from '../../src/infrastructure/http/controllers/StationController';
import { TypeParameterController } from '../../src/infrastructure/http/controllers/TypeParameterController';
import { UserController } from '../../src/infrastructure/http/controllers/UserController';
import { JwtTokenService } from '../../src/infrastructure/security/JwtTokenService';
import type { Container } from '../../src/main/container';
import { UserRole } from '../../src/domain/enums/UserRole';
import { FakePasswordHasher } from '../fakes/FakePasswordHasher';
import { InMemoryStationRepository } from '../fakes/InMemoryStationRepository';
import { InMemoryTypeParameterRepository } from '../fakes/InMemoryTypeParameterRepository';
import { InMemoryUserRepository } from '../fakes/InMemoryUserRepository';

/** Mesmo segredo e validade em todos os testes, para gerar tokens fora da app. */
export const testTokenService = new JwtTokenService('segredo-de-teste-com-pelo-menos-32-caracteres', 8);

/** Cabeçalho `Authorization` de uma sessão com o perfil pedido, para chamar rotas protegidas. */
export function authAs(role: UserRole = UserRole.ADMIN, community: string | null = null): { Authorization: string } {
  const { token } = testTokenService.issue({ userId: randomUUID(), role, community });
  return { Authorization: `Bearer ${token}` };
}

/** Sessão de administrador, que pode tudo: usada pelos testes que não tratam de permissão. */
export const asAdmin = authAs(UserRole.ADMIN);

/**
 * Monta a app Express com repositórios em memória — mesmo composition root de
 * `main/container.ts`, mas trocando os adaptadores TypeORM pelos fakes de teste.
 */
export function buildTestApp(
  stationRepository = new InMemoryStationRepository(),
  userRepository = new InMemoryUserRepository(),
  typeParameterRepository = new InMemoryTypeParameterRepository(),
): {
  app: Express;
  stationRepository: InMemoryStationRepository;
  userRepository: InMemoryUserRepository;
} {
  const container: Container = {
    tokenService: testTokenService,
    authController: new AuthController(
      new LoginUseCase(userRepository, new FakePasswordHasher(), testTokenService),
      new GetCurrentUserUseCase(userRepository),
    ),
    stationController: new StationController(
      new CreateStationUseCase(stationRepository, typeParameterRepository),
      new ListStationsUseCase(stationRepository),
      new GetStationUseCase(stationRepository),
      new UpdateStationUseCase(stationRepository),
      new DeleteStationUseCase(stationRepository),
      new ListCommunitiesUseCase(stationRepository),
    ),
    typeParameterController: new TypeParameterController(
      new ListTypeParametersUseCase(typeParameterRepository),
      new CreateTypeParameterUseCase(typeParameterRepository),
      new UpdateTypeParameterUseCase(typeParameterRepository),
      new DeleteTypeParameterUseCase(typeParameterRepository),
    ),
    userController: new UserController(
      new CreateUserUseCase(userRepository, new FakePasswordHasher()),
      new UpdateUserUseCase(userRepository),
      new ListUsersUseCase(userRepository),
      new DeleteUserUseCase(userRepository),
    ),
  };

  return { app: createApp(container), stationRepository, userRepository };
}
