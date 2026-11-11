import { z } from 'zod';
import { Biome } from '../../../domain/enums/Biome';
import { isValidTimeZone } from '../../../domain/validators/timezone';

/** Latitude/longitude chegam como string (assim estão no modelo), mas precisam ser numéricas. */
const coordinate = (min: number, max: number, label: string) =>
  z
    .string()
    .trim()
    .refine((value) => {
      const parsed = Number(value);
      return Number.isFinite(parsed) && parsed >= min && parsed <= max;
    }, `${label} deve ser um número entre ${min} e ${max}.`);

const biome = z.nativeEnum(Biome, {
  errorMap: () => ({ message: 'Bioma deve ser PANTANAL, CERRADO ou AMAZONIA.' }),
});

const community = z
  .string()
  .trim()
  .min(2, 'Informe a comunidade.')
  .max(120, 'A comunidade deve ter no máximo 120 caracteres.');

const timezone = z
  .string()
  .trim()
  .refine(isValidTimeZone, 'Fuso horário inválido. Use o formato America/Campo_Grande.');

const communicationTimeoutMinutes = z
  .number({ invalid_type_error: 'O tempo limite deve ser um número de minutos.' })
  .int('O tempo limite deve ser um número inteiro de minutos.')
  .min(15, 'O tempo limite deve ficar entre 15 e 1440 minutos.')
  .max(1440, 'O tempo limite deve ficar entre 15 e 1440 minutos.');

export const createStationBodySchema = z.object({
  uuid: z.string().trim().min(1, 'Informe o uuid da estação.').max(255),
  name: z.string().trim().min(3, 'O nome deve ter ao menos 3 caracteres.').max(255),
  latitude: coordinate(-90, 90, 'Latitude'),
  longitude: coordinate(-180, 180, 'Longitude'),
  biome,
  community,
  timezone,
  communicationTimeoutMinutes: communicationTimeoutMinutes.default(60),
  typeParameterIds: z
    .array(z.string().regex(/^\d+$/, 'Id de tipo de parâmetro inválido.'))
    .min(1, 'A estação precisa de ao menos um parâmetro.'),
});

export const updateStationBodySchema = z
  .object({
    name: z.string().trim().min(3).max(255).optional(),
    latitude: coordinate(-90, 90, 'Latitude').optional(),
    longitude: coordinate(-180, 180, 'Longitude').optional(),
  })
  .refine((body) => Object.keys(body).length > 0, 'Informe ao menos um campo para atualizar.');

export const stationStatusBodySchema = z.object({
  active: z.boolean({ required_error: 'Informe active: true ou false.' }),
});

export const stationIdParamsSchema = z.object({
  id: z.string().uuid('Id de estação inválido.'),
});

export const listStationsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  perPage: z.coerce.number().int().positive().max(100).default(20),
  name: z.string().trim().min(1).optional(),
});

export type CreateStationBody = z.infer<typeof createStationBodySchema>;
export type UpdateStationBody = z.infer<typeof updateStationBodySchema>;
export type ListStationsQuery = z.infer<typeof listStationsQuerySchema>;
