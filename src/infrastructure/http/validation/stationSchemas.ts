import { z } from 'zod';

/** Latitude/longitude chegam como string (assim estão no modelo), mas precisam ser numéricas. */
const coordinate = (min: number, max: number, label: string) =>
  z
    .string()
    .trim()
    .refine((value) => {
      const parsed = Number(value);
      return Number.isFinite(parsed) && parsed >= min && parsed <= max;
    }, `${label} deve ser um número entre ${min} e ${max}.`);

export const createStationBodySchema = z.object({
  uuid: z.string().trim().min(1, 'Informe o uuid da estação.').max(255),
  name: z.string().trim().min(3, 'O nome deve ter ao menos 3 caracteres.').max(255),
  latitude: coordinate(-90, 90, 'Latitude'),
  longitude: coordinate(-180, 180, 'Longitude'),
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
