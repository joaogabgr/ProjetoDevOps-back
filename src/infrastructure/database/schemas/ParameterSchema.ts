import { EntitySchema } from 'typeorm';
import { Parameter } from '../../../domain/entities/Parameter';

export const ParameterSchema = new EntitySchema<Parameter>({
  name: 'Parameter',
  tableName: 'parameters',
  target: Parameter,
  columns: {
    id: { type: 'uuid', primary: true, generated: 'uuid' },
    stationId: { name: 'id_station', type: 'uuid' },
    typeParameterId: { name: 'id_type_parameter', type: 'bigint' },
  },
  relations: {
    station: {
      type: 'many-to-one',
      target: 'Station',
      inverseSide: 'parameters',
      joinColumn: { name: 'id_station' },
      onDelete: 'CASCADE',
      nullable: false,
    },
    typeParameter: {
      type: 'many-to-one',
      target: 'TypeParameter',
      joinColumn: { name: 'id_type_parameter' },
      onDelete: 'RESTRICT',
      nullable: false,
    },
    measures: {
      type: 'one-to-many',
      target: 'Measure',
      inverseSide: 'parameter',
    },
    typeAlerts: {
      type: 'one-to-many',
      target: 'TypeAlert',
      inverseSide: 'parameter',
    },
  },
  // A mesma estação não mede a mesma grandeza duas vezes.
  uniques: [{ name: 'uq_parameters_station_type', columns: ['stationId', 'typeParameterId'] }],
});
