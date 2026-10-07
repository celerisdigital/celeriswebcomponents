import type { RoleConfig } from '../../entities/roles/types'

export interface IMeAddress {
  cep: string
  city: string
  uf: string
  street: string
  number: string
  district: string
  complement?: string
}

export interface IMeBankAccount {
  document: string
  pix?: { kind: string; key: string }
  account?: {
    bank: string
    accountType: string
    agency: string
    accountNumber: string
    accountDigit: string
    accountOwner?: string
  }
}

export interface IMe {
  id: number
  name: string
  email: string
  document: string
  role: string
  data?: {
    phone?: string
    fantasy?: string
    address?: IMeAddress
    bankAccount?: IMeBankAccount
  }
}

export interface IUpdateMePayload {
  name?: string
  email?: string
  password?: string
  oldPassword?: string
  extraData?: Record<string, unknown>
}

export type ProfileRoleConfig = Pick<RoleConfig, 'fields' | 'canBePJ'>
