import { EntitySchema } from 'typeorm';
import { Station } from '../../../domain/entities/Station';
import { bigintToNumber } from './transformers';

export const StationSchema = new EntitySchema<Station>({
  name: 'Station',
  tableName: 'stations',
  target: Station,
  columns: {
    id: { type: 'uuid', primary: true, generated: 'uuid' },
    uuid: { type: 'varchar', length: 255, unique: true },
    name: { type: 'varchar', length: 255 },
    latitude: { type: 'varchar', length: 64 },
    longitude: { type: 'varchar', length: 64 },
    createdAt: { name: 'created_at', type: 'timestamptz', createDate: true },
    dateLastMeasure: {
      name: 'date_last_measure',
      type: 'bigint',
      nullable: true,
      transformer: bigintToNumber,
    },
  },
  relations: {
    parameters: {
      type: 'one-to-many',
      target: 'Parameter',
      inverseSide: 'station',
      cascade: ['insert'],
    },
    emails: {
      type: 'one-to-many',
      target: 'EmailStation',
      inverseSide: 'station',
      cascade: ['insert'],
    },
    measureAverages: {
      type: 'one-to-many',
      target: 'MeasureAverage',
      inverseSide: 'station',
    },
  },
  indices: [{ name: 'idx_stations_name', columns: ['name'] }],
});
