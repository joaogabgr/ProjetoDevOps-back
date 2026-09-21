import type { Station } from './Station';

/** E-mail que recebe as notificações de alerta de uma estação. */
export class EmailStation {
  id!: string;
  email!: string;
  stationId!: string;

  station?: Station;
}
