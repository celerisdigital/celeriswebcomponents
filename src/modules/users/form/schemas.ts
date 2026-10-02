import { z } from 'zod'
import { digitsOnly, splitBankAccount } from '../../../lib/format'
import { isInvalidNumericSequence } from '../../../lib/bank'

const addressSchema = z.object({
  cep: z.string().min(1, 'CEP é obrigatório'),
  uf: z.string().min(1, 'UF é obrigatória'),
  city: z.string().min(1, 'Cidade é obrigatória'),
  district: z.string().min(1, 'Bairro é obrigatório'),
  street: z.string().min(1, 'Rua é obrigatória'),
  number: z.string().min(1, 'Número é obrigatório'),
  complement: z.string().optional(),
})

const onlyDigitsOrX = (v: string) => {
  if (!v) return true

  for (const ch of v) {
    if (isNaN(Number(ch)) && ch.toLowerCase() !== 'x') return false
  }

  return true
}

export const bankAccountSchema = z.object({
  document: z.string().min(1, 'CPF/CNPJ do titular é obrigatório'),
  pix: z.object({
    kind: z.string().min(1, 'Tipo de chave é obrigatório'),
    key: z.string().min(1, 'Chave PIX é obrigatória'),
  }),
  account: z.object({
    bank: z.string().optional(),
    accountType: z.string().optional(),
    agency: z.string().optional(),
    accountNumber: z.string().optional(),
    accountOwner: z.string().optional(),
  }).superRefine((acc, ctx) => {
    if (!acc.bank) {
      ctx.addIssue({ code: 'custom', message: 'Banco é obrigatório', path: ['bank'] })
    }

    if (!acc.accountType) {
      ctx.addIssue({ code: 'custom', message: 'Tipo de conta é obrigatório', path: ['accountType'] })
    }

    if (!acc.agency) {
      ctx.addIssue({ code: 'custom', message: 'Agência é obrigatória', path: ['agency'] })
    } else if (!onlyDigitsOrX(acc.agency)) {
      ctx.addIssue({ code: 'custom', message: 'Informe apenas números', path: ['agency'] })
    } else if (acc.agency.length > 4) {
      ctx.addIssue({ code: 'custom', message: 'Agência deve ter no máximo 4 dígitos', path: ['agency'] })
    } else if (isInvalidNumericSequence(acc.agency)) {
      ctx.addIssue({ code: 'custom', message: 'Agência não pode ser uma sequência repetida', path: ['agency'] })
    }

    if (!acc.accountNumber) {
      ctx.addIssue({ code: 'custom', message: 'Número da conta é obrigatório', path: ['accountNumber'] })
    } else {
      const { accountNumber, accountDigit } = splitBankAccount(acc.accountNumber)

      if (!accountDigit) {
        ctx.addIssue({ code: 'custom', message: 'Informe o dígito da conta', path: ['accountNumber'] })
      } else if (!accountNumber) {
        ctx.addIssue({ code: 'custom', message: 'Número da conta é obrigatório', path: ['accountNumber'] })
      } else if (!/^[0-9]+$/.test(accountNumber)) {
        ctx.addIssue({ code: 'custom', message: 'Informe apenas números', path: ['accountNumber'] })
      } else if (isInvalidNumericSequence(accountNumber)) {
        ctx.addIssue({ code: 'custom', message: 'Conta não pode ser uma sequência repetida', path: ['accountNumber'] })
      }
    }

    if (!acc.accountOwner) {
      ctx.addIssue({ code: 'custom', message: 'Titular da conta é obrigatório', path: ['accountOwner'] })
    }
  }),
}).superRefine((bankAccount, ctx) => {
  const kind = bankAccount.pix.kind

  if (kind !== 'cpf' && kind !== 'cnpj') return

  const expected = kind === 'cpf' ? 11 : 14

  if (digitsOnly(bankAccount.document).length !== expected) {
    ctx.addIssue({
      code: 'custom',
      message: 'Tipo de chave não corresponde ao documento do titular',
      path: ['pix', 'kind'],
    })
  }
})

export type BankAccountValues = z.infer<typeof bankAccountSchema>

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
  phone: z.string().refine((v) => { const d = digitsOnly(v); return d.length === 10 || d.length === 11 }, 'Telefone inválido'),
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

export const PIX_KIND_OPTIONS = [
  { value: 'cpf', label: 'CPF' },
  { value: 'cnpj', label: 'CNPJ' },
  { value: 'email', label: 'E-mail' },
  { value: 'phone', label: 'Telefone' },
  { value: 'uuid', label: 'Chave aleatória' },
]

type ExtraFields = Pick<CreateUserValues, 'phone' | 'address' | 'bankAccount' | 'fantasy' | 'responsible'>

export function buildExtraData(values: ExtraFields): Record<string, unknown> {
  const extraData: Record<string, unknown> = {}

  const phone = digitsOnly(values.phone ?? '')
  if (phone) extraData.phone = `55${phone}`

  const cep = digitsOnly(values.address?.cep ?? '')
  if (cep) {
    extraData.address = {
      cep,
      city: values.address!.city,
      uf: values.address!.uf,
      street: values.address!.street,
      number: values.address?.number || 'S/N',
      district: values.address!.district,
      complement: values.address?.complement || undefined,
    }
  }

  const bankDoc = digitsOnly(values.bankAccount?.document ?? '')
  if (bankDoc) {
    const { accountNumber, accountDigit } = splitBankAccount(values.bankAccount!.account.accountNumber ?? '')

    extraData.bankAccount = {
      document: bankDoc,
      pix: {
        kind: values.bankAccount!.pix.kind,
        key: values.bankAccount!.pix.key,
      },
      account: {
        bank: values.bankAccount!.account.bank,
        accountType: values.bankAccount!.account.accountType,
        agency: values.bankAccount!.account.agency,
        accountNumber,
        accountDigit,
        accountOwner: values.bankAccount!.account.accountOwner,
      },
    }
  }

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
