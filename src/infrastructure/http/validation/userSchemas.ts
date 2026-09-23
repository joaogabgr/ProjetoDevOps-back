import { z } from 'zod';
import { UserRole } from '../../../domain/enums/UserRole';

export const createUserBodySchema = z.object({
  name: z.string().trim().min(3, 'O nome deve ter ao menos 3 caracteres.').max(255),
  email: z.string().trim().toLowerCase().email('E-mail inválido.').max(255),
  // bcrypt ignora bytes além do 72º; barramos antes para não dar falsa sensação de senha longa.
  password: z
    .string()
    .min(8, 'A senha deve ter ao menos 8 caracteres.')
    .max(72, 'A senha deve ter no máximo 72 caracteres.'),
  cpf: z
    .string()
    .trim()
    .transform((value) => value.replace(/\D/g, ''))
    .refine((value) => value.length === 11, 'CPF deve conter 11 dígitos.'),
  role: z.nativeEnum(UserRole, {
    errorMap: () => ({ message: `role deve ser um dos valores: ${Object.values(UserRole).join(', ')}.` }),
  }),
});

export const updateUserBodySchema = z
  .object({
    name: z.string().trim().min(3, 'O nome deve ter ao menos 3 caracteres.').max(255).optional(),
    email: z.string().trim().toLowerCase().email('E-mail inválido.').max(255).optional(),
    role: z
      .nativeEnum(UserRole, {
        errorMap: () => ({
          message: `role deve ser um dos valores: ${Object.values(UserRole).join(', ')}.`,
        }),
      })
      .optional(),
    active: z.boolean().optional(),
  })
  .refine((body) => Object.keys(body).length > 0, 'Informe ao menos um campo para atualizar.');

export const userIdParamsSchema = z.object({
  id: z.string().uuid('Id de usuário inválido.'),
});

export type CreateUserBody = z.infer<typeof createUserBodySchema>;
export type UpdateUserBody = z.infer<typeof updateUserBodySchema>;
