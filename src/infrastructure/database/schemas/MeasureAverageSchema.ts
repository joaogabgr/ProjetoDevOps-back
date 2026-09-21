import { EntitySchema } from 'typeorm';
import { MeasureAverage } from '../../../domain/entities/MeasureAverage';
import { AVERAGE_TYPES } from '../../../domain/enums/AverageType';

export const MeasureAverageSchema = new EntitySchema<MeasureAverage>({
  name: 'MeasureAverage',
  tableName: 'measures_average',
  target: MeasureAverage,
  columns: {
    id: { type: 'uuid', primary: true, generated: 'uuid' },
    typeAverage: {
      name: 'type_average',
      type: 'enum',
      enum: AVERAGE_TYPES,
      enumName: 'average_type',
    },
    name: { type: 'varchar', length: 128 },
    value: { type: 'double precision' },
    createdAt: { name: 'created_at', type: 'timestamptz', createDate: true },
    stationId: { name: 'id_station', type: 'uuid' },
  },
  relations: {
    station: {
      type: 'many-to-one',
      target: 'Station',
      inverseSide: 'measureAverages',
      joinColumn: { name: 'id_station' },
      onDelete: 'CASCADE',
      nullable: false,
    },
  },
  indices: [
    {
      name: 'idx_measures_average_station_type_created',
      columns: ['stationId', 'typeAverage', 'createdAt'],
    },
  ],
});
