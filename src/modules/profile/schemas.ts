import { z } from 'zod'
import type { IMe } from './types'

function optionalPattern(pattern: RegExp, message: string) {
  return z.string().refine((value) => value === '' || pattern.test(value), message)
}

function optionalLength(min: number, max: number, message: string) {
  return z.string().refine((value) => value === '' || (value.length >= min && value.length <= max), message)
}

export const profileSchema = z.object({
  name: z.string().max(256, 'Máximo de 256 caracteres'),
  email: z
    .string()
    .max(128, 'Máximo de 128 caracteres')
    .refine((value) => value === '' || z.email().safeParse(value).success, 'E-mail inválido'),
  oldPassword: optionalLength(6, 80, 'A senha deve ter entre 6 e 80 caracteres'),
  password: optionalLength(6, 80, 'A senha deve ter entre 6 e 80 caracteres'),
  phone: optionalPattern(/^\d{12,13}$/, 'Informe 12 ou 13 dígitos'),
  address: z.object({
    cep: optionalPattern(/^\d{8}$/, 'Informe 8 dígitos'),
    uf: z.string(),
    city: z.string(),
    district: z.string(),
    street: z.string(),
    number: z.string(),
    complement: z.string(),
  }),
  bankAccount: z.object({
    document: optionalPattern(/^\d{11,14}$/, 'Informe de 11 a 14 dígitos'),
    pix: z.object({
      kind: z.string(),
      key: z.string(),
    }),
    account: z.object({
      bank: z.string(),
      accountType: z.string(),
      agency: z.string(),
      accountNumber: z.string(),
      accountDigit: z.string(),
      accountOwner: z.string(),
    }),
  }),
  fantasy: z.string(),
})

export type ProfileValues = z.infer<typeof profileSchema>

export function toProfileValues(me: IMe): ProfileValues {
  const address = me.data?.address
  const bank = me.data?.bankAccount

  return {
    name: me.name ?? '',
    email: me.email ?? '',
    oldPassword: '',
    password: '',
    phone: me.data?.phone ?? '',
    address: {
      cep: address?.cep ?? '',
      uf: address?.uf ?? '',
      city: address?.city ?? '',
      district: address?.district ?? '',
      street: address?.street ?? '',
      number: address?.number ?? '',
      complement: address?.complement ?? '',
    },
    bankAccount: {
      document: bank?.document ?? '',
      pix: {
        kind: bank?.pix?.kind ?? '',
        key: bank?.pix?.key ?? '',
      },
      account: {
        bank: bank?.account?.bank ?? '',
        accountType: bank?.account?.accountType ?? '',
        agency: bank?.account?.agency ?? '',
        accountNumber: bank?.account?.accountNumber ?? '',
        accountDigit: bank?.account?.accountDigit ?? '',
        accountOwner: bank?.account?.accountOwner ?? '',
      },
    },
    fantasy: me.data?.fantasy ?? '',
  }
}
