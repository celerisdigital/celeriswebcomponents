import { z } from 'zod'
import { digitsOnly, formatDocument, joinBankAccount, maskCEP, maskPhone, splitBankAccount } from '../../../lib/format'
import { isInvalidNumericSequence } from '../../../lib/bank'

export const phoneSchema = z
  .string()
  .refine((v) => { const d = digitsOnly(v); return d.length === 10 || d.length === 11 }, 'Telefone inválido')

export const addressSchema = z.object({
  cep: z.string().min(1, 'CEP é obrigatório'),
  uf: z.string().min(1, 'UF é obrigatória'),
  city: z.string().min(1, 'Cidade é obrigatória'),
  district: z.string().min(1, 'Bairro é obrigatório'),
  street: z.string().min(1, 'Rua é obrigatória'),
  number: z.string().min(1, 'Número é obrigatório'),
  complement: z.string().optional(),
})

export type AddressValues = z.infer<typeof addressSchema>

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

export interface ContactValues {
  email?: string
  phone?: string
  address?: AddressValues
  bankAccount?: BankAccountValues
}

export const PIX_KIND_OPTIONS = [
  { value: 'cpf', label: 'CPF' },
  { value: 'cnpj', label: 'CNPJ' },
  { value: 'email', label: 'E-mail' },
  { value: 'phone', label: 'Telefone' },
  { value: 'uuid', label: 'Chave aleatória' },
]

export interface StoredAddress {
  cep?: string
  uf?: string
  city?: string
  district?: string
  street?: string
  number?: string
  complement?: string
}

export interface StoredBankAccount {
  document?: string
  pix?: { kind?: string; key?: string }
  account?: {
    bank?: string
    accountType?: string
    agency?: string
    accountNumber?: string
    accountDigit?: string
    accountOwner?: string
  }
}

export function toPhoneValue(raw: string | undefined): string {
  const digits = digitsOnly(raw ?? '')

  return maskPhone(digits.length >= 12 ? digits.slice(2) : digits)
}

export function toAddressValues(address?: StoredAddress): AddressValues {
  return {
    cep: maskCEP(address?.cep ?? ''),
    uf: address?.uf ?? '',
    city: address?.city ?? '',
    district: address?.district ?? '',
    street: address?.street ?? '',
    number: address?.number ?? '',
    complement: address?.complement ?? '',
  }
}

export function toBankAccountValues(bank?: StoredBankAccount): BankAccountValues {
  return {
    document: formatDocument(bank?.document ?? ''),
    pix: { kind: bank?.pix?.kind ?? '', key: bank?.pix?.key ?? '' },
    account: {
      bank: bank?.account?.bank ?? '',
      accountType: bank?.account?.accountType ?? '',
      agency: bank?.account?.agency ?? '',
      accountNumber: joinBankAccount(bank?.account?.accountNumber ?? '', bank?.account?.accountDigit ?? ''),
      accountOwner: bank?.account?.accountOwner ?? '',
    },
  }
}

export function buildContactExtraData(values: ContactValues): Record<string, unknown> {
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

  return extraData
}
