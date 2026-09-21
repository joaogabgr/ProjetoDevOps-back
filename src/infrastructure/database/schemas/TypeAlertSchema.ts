import { EntitySchema } from 'typeorm';
import { TypeAlert } from '../../../domain/entities/TypeAlert';
import { COMPARISON_OPERATORS } from '../../../domain/enums/ComparisonOperator';
import { requiredBigintToNumber } from './transformers';

export const TypeAlertSchema = new EntitySchema<TypeAlert>({
  name: 'TypeAlert',
  tableName: 'type_alerts',
  target: TypeAlert,
  columns: {
    id: { type: 'uuid', primary: true, generated: 'uuid' },
    name: { type: 'varchar', length: 128 },
    value: { type: 'bigint', transformer: requiredBigintToNumber },
    comparisonOperator: {
      name: 'comparison_operator',
      type: 'enum',
      enum: COMPARISON_OPERATORS,
      enumName: 'comparison_operator',
    },
    parameterId: { name: 'id_parameter', type: 'uuid' },
  },
  relations: {
    parameter: {
      type: 'many-to-one',
      target: 'Parameter',
      inverseSide: 'typeAlerts',
      joinColumn: { name: 'id_parameter' },
      onDelete: 'CASCADE',
      nullable: false,
    },
    alerts: {
      type: 'one-to-many',
      target: 'Alert',
      inverseSide: 'typeAlert',
    },
  },
  indices: [{ name: 'idx_type_alerts_parameter', columns: ['parameterId'] }],
});
