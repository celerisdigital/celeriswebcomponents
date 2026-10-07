import { digitsOnly } from '../../lib/format'
import type { ProfileValues } from './schemas'
import type { IUpdateMePayload } from './types'

export interface ProfileSections {
  phone: boolean
  address: boolean
  bankAccount: boolean
  fantasy: boolean
}

export function toUpdateMePayload(values: ProfileValues, sections: ProfileSections): IUpdateMePayload {
  const extraData: Record<string, unknown> = {}

  const phone = sections.phone ? digitsOnly(values.phone) : ''

  if (phone) extraData.phone = phone

  const cep = sections.address ? digitsOnly(values.address.cep) : ''

  if (cep) {
    extraData.address = {
      cep,
      city: values.address.city,
      uf: values.address.uf,
      street: values.address.street,
      number: values.address.number || 'S/N',
      district: values.address.district,
      complement: values.address.complement || undefined,
    }
  }

  const bankDoc = sections.bankAccount ? digitsOnly(values.bankAccount.document) : ''

  if (bankDoc) {
    const { pix, account } = values.bankAccount

    extraData.bankAccount = {
      document: bankDoc,
      pix: { kind: pix.kind, key: pix.key },
      account: account.bank
        ? {
            bank: account.bank,
            accountType: account.accountType,
            agency: account.agency,
            accountNumber: account.accountNumber,
            accountDigit: account.accountDigit,
            accountOwner: account.accountOwner || undefined,
          }
        : undefined,
    }
  }

  if (sections.fantasy && values.fantasy) extraData.fantasy = values.fantasy

  return {
    name: values.name || undefined,
    email: values.email || undefined,
    password: values.password || undefined,
    oldPassword: values.oldPassword || undefined,
    extraData: Object.keys(extraData).length > 0 ? extraData : undefined,
  }
}
