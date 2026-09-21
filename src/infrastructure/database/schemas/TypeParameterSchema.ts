import { EntitySchema } from 'typeorm';
import { TypeParameter } from '../../../domain/entities/TypeParameter';

export const TypeParameterSchema = new EntitySchema<TypeParameter>({
  name: 'TypeParameter',
  tableName: 'type_parameters',
  target: TypeParameter,
  columns: {
    // `bigint` conforme o modelo. O driver entrega como string, e é assim que o
    // domínio declara o id — evita perda de precisão sem transformer.
    id: { type: 'bigint', primary: true, generated: 'increment' },
    typeJson: { name: 'type_json', type: 'varchar', length: 64, unique: true },
    name: { type: 'varchar', length: 128, unique: true },
    unit: { type: 'varchar', length: 32 },
    numberOfDecimalCases: { name: 'number_of_decimal_cases', type: 'int', default: 2 },
    factor: { type: 'int', default: 1 },
    offset: { type: 'int', default: 0 },
  },
});
