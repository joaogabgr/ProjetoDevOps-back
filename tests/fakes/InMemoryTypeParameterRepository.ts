import { TypeParameter } from '../../src/domain/entities/TypeParameter';
import { NotFoundError } from '../../src/domain/errors/DomainError';
import type {
  CreateTypeParameterData,
  TypeParameterRepository,
  UpdateTypeParameterData,
} from '../../src/domain/repositories/TypeParameterRepository';

/** Implementação em memória da porta `TypeParameterRepository`, usada só em teste. */
export class InMemoryTypeParameterRepository implements TypeParameterRepository {
  /** Quantas estações têm cada parâmetro instalado; preencha com `linkToStations`. */
  private readonly stationLinks = new Map<string, number>();

  constructor(private readonly typeParameters: TypeParameter[] = []) {}

  linkToStations(id: string, count: number): void {
    this.stationLinks.set(id, count);
  }

  /** Leituras por parâmetro, para testar a regra de exclusão. */
  private readonly measureCounts = new Map<string, number>();

  recordMeasures(id: string, count: number): void {
    this.measureCounts.set(id, count);
  }

  async create(data: CreateTypeParameterData): Promise<TypeParameter> {
    const nextId = Math.max(0, ...this.typeParameters.map((tp) => Number(tp.id))) + 1;
    const typeParameter = buildTypeParameter({ ...data, id: String(nextId), factor: 1, offset: 0 });
    this.typeParameters.push(typeParameter);
    return typeParameter;
  }

  async update(id: string, data: UpdateTypeParameterData): Promise<TypeParameter> {
    const typeParameter = this.typeParameters.find((tp) => String(tp.id) === id);
    if (!typeParameter) {
      throw new NotFoundError('Parâmetro', id);
    }
    Object.assign(
      typeParameter,
      Object.fromEntries(Object.entries(data).filter(([, value]) => value !== undefined)),
    );
    return typeParameter;
  }

  async delete(id: string): Promise<void> {
    const index = this.typeParameters.findIndex((tp) => String(tp.id) === id);
    if (index >= 0) this.typeParameters.splice(index, 1);
  }

  async countStationLinks(id: string): Promise<number> {
    return this.stationLinks.get(id) ?? 0;
  }

  async countMeasures(id: string): Promise<number> {
    return this.measureCounts.get(id) ?? 0;
  }

  async unlinkFromStations(id: string): Promise<void> {
    this.stationLinks.delete(id);
  }

  async findByTypeJson(typeJson: string): Promise<TypeParameter | null> {
    return this.typeParameters.find((tp) => tp.typeJson === typeJson) ?? null;
  }

  async findByName(name: string): Promise<TypeParameter | null> {
    return this.typeParameters.find((tp) => tp.name === name) ?? null;
  }

  /** Mesma ordem do adaptador TypeORM: por nome. */
  async findAll(): Promise<TypeParameter[]> {
    return [...this.typeParameters].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  }

  async findById(id: string): Promise<TypeParameter | null> {
    return this.typeParameters.find((tp) => String(tp.id) === id) ?? null;
  }

  async findExistingIds(ids: ReadonlyArray<string>): Promise<string[]> {
    const existing = new Set(this.typeParameters.map((tp) => String(tp.id)));
    return ids.filter((id) => existing.has(id));
  }
}

export function buildTypeParameter(overrides: Partial<TypeParameter> = {}): TypeParameter {
  const typeParameter = new TypeParameter();
  typeParameter.id = overrides.id ?? '1';
  typeParameter.typeJson = overrides.typeJson ?? 'temp';
  typeParameter.name = overrides.name ?? 'Temperatura';
  typeParameter.unit = overrides.unit ?? '°C';
  typeParameter.numberOfDecimalCases = overrides.numberOfDecimalCases ?? 1;
  typeParameter.factor = overrides.factor ?? 1;
  typeParameter.offset = overrides.offset ?? 0;
  return typeParameter;
}

/** Os 7 parâmetros que as placas enviam hoje, como ficam no banco depois das migrations. */
export function buildBoardTypeParameters(): TypeParameter[] {
  return [
    buildTypeParameter({ id: '1', typeJson: 'temp', name: 'Temperatura', unit: '°C', numberOfDecimalCases: 1 }),
    buildTypeParameter({ id: '2', typeJson: 'umid', name: 'Umidade Relativa', unit: '%', numberOfDecimalCases: 1 }),
    buildTypeParameter({ id: '3', typeJson: 'pressao', name: 'Pressão Atmosférica', unit: 'hPa', numberOfDecimalCases: 1 }),
    buildTypeParameter({ id: '4', typeJson: 'vento_vel', name: 'Velocidade do Vento', unit: 'm/s', numberOfDecimalCases: 2 }),
    buildTypeParameter({ id: '5', typeJson: 'vento_dir', name: 'Direção do Vento', unit: '°', numberOfDecimalCases: 0 }),
    buildTypeParameter({ id: '6', typeJson: 'chuva', name: 'Índice Pluviométrico', unit: 'mm', numberOfDecimalCases: 2 }),
    buildTypeParameter({ id: '7', typeJson: 'nivel', name: 'Nível do Rio', unit: 'cm', numberOfDecimalCases: 1 }),
  ];
}
