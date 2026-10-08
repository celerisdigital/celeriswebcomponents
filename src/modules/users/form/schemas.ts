import { z } from 'zod'
import { digitsOnly } from '../../../lib/format'
import { addressSchema, bankAccountSchema, buildContactExtraData, phoneSchema } from '../../../entities/users/form'

const passwordField = z
  .string()
  .max(80)
  .refine((v) => !v || v.length >= 6, 'Mínimo 6 caracteres')
  .optional()

const baseFields = {
  name: z.string().min(1, 'Nome é obrigatório').max(256),
  email: z.string().email('E-mail inválido').max(128),
  document: z.string().min(1, 'Documento é obrigatório'),
  password: passwordField,
  phone: phoneSchema,
  address: addressSchema.optional(),
  bankAccount: bankAccountSchema.optional(),
  fantasy: z.string().optional(),
  responsible: z.object({
    name: z.string().min(1, 'Nome do responsável é obrigatório'),
    document: z.string().refine((v) => digitsOnly(v).length === 11, 'CPF inválido'),
  }).optional(),
}

export const createUserSchema = z.object({
  role: z.string().min(1, 'Selecione um perfil'),
  ...baseFields,
})

export type CreateUserValues = z.infer<typeof createUserSchema>

export const updateUserSchema = z.object(baseFields)

export type UpdateUserValues = z.infer<typeof updateUserSchema>

type ExtraFields = Pick<CreateUserValues, 'phone' | 'address' | 'bankAccount' | 'fantasy' | 'responsible'>

export function buildExtraData(values: ExtraFields): Record<string, unknown> {
  const extraData = buildContactExtraData(values)

  if (values.fantasy) extraData.fantasy = values.fantasy

  const respDoc = digitsOnly(values.responsible?.document ?? '')
  if (respDoc) {
    extraData.responsible = {
      document: respDoc,
      name: values.responsible!.name,
    }
  }

  return extraData
}
