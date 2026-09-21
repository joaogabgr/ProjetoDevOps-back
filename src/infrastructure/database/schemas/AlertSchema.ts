import { EntitySchema } from 'typeorm';
import { Alert } from '../../../domain/entities/Alert';

export const AlertSchema = new EntitySchema<Alert>({
  name: 'Alert',
  tableName: 'alerts',
  target: Alert,
  columns: {
    id: { type: 'uuid', primary: true, generated: 'uuid' },
    measureId: { name: 'id_measure', type: 'uuid' },
    typeAlertId: { name: 'id_type_alert', type: 'uuid' },
    createdAt: { name: 'created_at', type: 'timestamptz', createDate: true },
  },
  relations: {
    measure: {
      type: 'many-to-one',
      target: 'Measure',
      inverseSide: 'alerts',
      joinColumn: { name: 'id_measure' },
      onDelete: 'CASCADE',
      nullable: false,
    },
    typeAlert: {
      type: 'many-to-one',
      target: 'TypeAlert',
      inverseSide: 'alerts',
      joinColumn: { name: 'id_type_alert' },
      onDelete: 'CASCADE',
      nullable: false,
    },
  },
  // Uma medida não dispara o mesmo tipo de alerta duas vezes.
  uniques: [{ name: 'uq_alerts_measure_type', columns: ['measureId', 'typeAlertId'] }],
  indices: [{ name: 'idx_alerts_created_at', columns: ['createdAt'] }],
});
