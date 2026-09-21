import type { Measure } from './Measure';
import type { Station } from './Station';
import type { TypeAlert } from './TypeAlert';
import type { TypeParameter } from './TypeParameter';

/**
 * Um sensor concreto de uma estação: liga a estação ao tipo de grandeza que ela mede.
 *
 * Toda medida e todo tipo de alerta pendura aqui, e não na estação, porque o limite
 * de "chuva acima de X" só faz sentido para o parâmetro de chuva daquela estação.
 */
export class Parameter {
  id!: string;
  stationId!: string;
  typeParameterId!: string;

  station?: Station;
  typeParameter?: TypeParameter;
  measures?: Measure[];
  typeAlerts?: TypeAlert[];
}
