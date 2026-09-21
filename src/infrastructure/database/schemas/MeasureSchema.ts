import { EntitySchema } from 'typeorm';
import { Measure } from '../../../domain/entities/Measure';
import { requiredBigintToNumber } from './transformers';

export const MeasureSchema = new EntitySchema<Measure>({
  name: 'Measure',
  tableName: 'measures',
  target: Measure,
  columns: {
    id: { type: 'uuid', primary: true, generated: 'uuid' },
    unixTime: {
      name: 'unix_time',
      type: 'bigint',
      transformer: requiredBigintToNumber,
    },
    value: { type: 'double precision' },
    parameterId: { name: 'id_parameter', type: 'uuid' },
  },
  relations: {
    parameter: {
      type: 'many-to-one',
      target: 'Parameter',
      inverseSide: 'measures',
      joinColumn: { name: 'id_parameter' },
      onDelete: 'CASCADE',
      nullable: false,
    },
    alerts: {
      type: 'one-to-many',
      target: 'Alert',
      inverseSide: 'measure',
    },
  },
  // As consultas dos painéis são sempre "parâmetro X em uma janela de tempo".
  indices: [{ name: 'idx_measures_parameter_unix_time', columns: ['parameterId', 'unixTime'] }],
});
