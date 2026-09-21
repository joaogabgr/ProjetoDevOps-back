import { EntitySchema } from 'typeorm';
import { EmailStation } from '../../../domain/entities/EmailStation';

export const EmailStationSchema = new EntitySchema<EmailStation>({
  name: 'EmailStation',
  tableName: 'emails_station',
  target: EmailStation,
  columns: {
    id: { type: 'uuid', primary: true, generated: 'uuid' },
    email: { type: 'varchar', length: 255 },
    stationId: { name: 'id_station', type: 'uuid' },
  },
  relations: {
    station: {
      type: 'many-to-one',
      target: 'Station',
      inverseSide: 'emails',
      joinColumn: { name: 'id_station' },
      onDelete: 'CASCADE',
      nullable: false,
    },
  },
  uniques: [{ name: 'uq_emails_station_station_email', columns: ['stationId', 'email'] }],
});
