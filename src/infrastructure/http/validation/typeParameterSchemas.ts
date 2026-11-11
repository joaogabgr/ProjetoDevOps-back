import { z } from 'zod';

export const createTypeParameterBodySchema = z.object({
  // A chave vai gravada nas placas: minúsculas, números e "_", como `vento_vel`.
  typeJson: z
    .string()
    .trim()
    .regex(/^[a-z][a-z0-9_]*$/, 'A chave deve começar com letra e ter só letras minúsculas, números e "_".')
    .max(64),
  name: z.string().trim().min(1, 'Informe o nome do parâmetro.').max(128),
  unit: z.string().trim().min(1, 'Informe a unidade.').max(32),
  numberOfDecimalCases: z.number().int().min(0).max(6).default(2),
});

export const updateTypeParameterBodySchema = z
  .object({
    name: z.string().trim().min(1, 'Informe o nome do parâmetro.').max(128).optional(),
    unit: z.string().trim().min(1, 'Informe a unidade.').max(32).optional(),
    numberOfDecimalCases: z.number().int().min(0).max(6).optional(),
  })
  .refine((body) => Object.values(body).some((value) => value !== undefined), 'Informe ao menos um campo para atualizar.');

export const typeParameterIdParamsSchema = z.object({
  id: z.string().regex(/^\d+$/, 'Id de parâmetro inválido.'),
});

export type CreateTypeParameterBody = z.infer<typeof createTypeParameterBodySchema>;
