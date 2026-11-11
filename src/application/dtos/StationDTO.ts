import type { Station } from '../../domain/entities/Station';
import type { Biome } from '../../domain/enums/Biome';

/** Representação da estação exposta pela API — desacoplada da entidade de domínio. */
export interface StationDTO {
  id: string;
  uuid: string;
  name: string;
  latitude: string;
  longitude: string;
  biome: Biome;
  community: string;
  timezone: string;
  communicationTimeoutMinutes: number;
  active: boolean;
  createdAt: string;
  dateLastMeasure: number | null;
  parameters?: Array<{
    id: string;
    typeParameterId: string;
    name?: string;
    unit?: string;
  }>;
}

export function toStationDTO(station: Station): StationDTO {
  const dto: StationDTO = {
    id: station.id,
    uuid: station.uuid,
    name: station.name,
    latitude: station.latitude,
    longitude: station.longitude,
    biome: station.biome,
    community: station.community,
    timezone: station.timezone,
    communicationTimeoutMinutes: station.communicationTimeoutMinutes,
    active: station.active,
    createdAt: station.createdAt.toISOString(),
    dateLastMeasure: station.dateLastMeasure,
  };

  if (station.parameters) {
    dto.parameters = station.parameters.map((parameter) => ({
      id: parameter.id,
      typeParameterId: parameter.typeParameterId,
      name: parameter.typeParameter?.name,
      unit: parameter.typeParameter?.unit,
    }));
  }

  return dto;
}
