import { z } from 'zod'
import {
  addressSchema,
  bankAccountSchema,
  phoneSchema,
  toAddressValues,
  toBankAccountValues,
  toPhoneValue,
} from '../../entities/users/form'
import type { IMe } from './types'

function optionalLength(min: number, max: number, message: string) {
  return z.string().refine((value) => value === '' || (value.length >= min && value.length <= max), message)
}

function hasAnyValue(value: unknown): boolean {
  if (typeof value === 'string') return value.trim() !== ''

  if (value && typeof value === 'object') return Object.values(value).some(hasAnyValue)

  return false
}

function allOrNothing<T extends z.ZodType>(schema: T) {
  return z.custom<z.input<T>>().superRefine((value, ctx) => {
    if (!hasAnyValue(value)) return

    const result = schema.safeParse(value)

    for (const issue of result.error?.issues ?? []) {
      ctx.addIssue({ code: 'custom', message: issue.message, path: issue.path })
    }
  })
}

export const profileSchema = z.object({
  name: z.string().max(256, 'Máximo de 256 caracteres'),
  email: z
    .string()
    .max(128, 'Máximo de 128 caracteres')
    .refine((value) => value === '' || z.email().safeParse(value).success, 'E-mail inválido'),
  oldPassword: optionalLength(6, 80, 'A senha deve ter entre 6 e 80 caracteres'),
  password: optionalLength(6, 80, 'A senha deve ter entre 6 e 80 caracteres'),
  phone: allOrNothing(phoneSchema).optional(),
  address: allOrNothing(addressSchema).optional(),
  bankAccount: allOrNothing(bankAccountSchema).optional(),
  fantasy: z.string().optional(),
}).superRefine((values, ctx) => {
  if (values.password && !values.oldPassword) {
    ctx.addIssue({ code: 'custom', message: 'Informe a senha atual para alterar a senha', path: ['oldPassword'] })
  }
})

export type ProfileValues = z.infer<typeof profileSchema>

export function toProfileValues(me: IMe): ProfileValues {
  return {
    name: me.name ?? '',
    email: me.email ?? '',
    oldPassword: '',
    password: '',
    phone: toPhoneValue(me.data?.phone),
    address: toAddressValues(me.data?.address),
    bankAccount: toBankAccountValues(me.data?.bankAccount),
    fantasy: me.data?.fantasy ?? '',
  }
}
