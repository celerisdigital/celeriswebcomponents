export interface IPermission {
  permission: number
  to?: number
  effect?: number
}

export interface IAddress {
  cep: string
  city: string
  uf: string
  street: string
  number: string
  district: string
  complement?: string
}

export interface IBankAccount {
  document: string
  pix: { kind: string; key: string }
  account?: {
    bank: string
    accountType: string
    agency: string
    accountNumber: string
    accountDigit: string
    accountOwner?: string
  }
}

export interface IUserData {
  phone?: string
  fantasy?: string
  responsibleName?: string
  responsibleDocument?: string
  address?: IAddress
  bankAccount?: IBankAccount
  needNFSe?: boolean
  autoRequestWithdraw?: boolean
  commissionLevel?: number
}

export interface IUserParent {
  id: number
  userId: number
  parentId: number
  parentRole: string
  level: number
}

export interface IUser {
  id?: number
  uuid: string
  name: string
  document: string
  email: string
  role: string
  parent?: { parentId: number; parentRole: string }
  status: number
  data?: IUserData
  parents?: IUserParent[]
  mayRedefinePass?: boolean
  permissions?: IPermission[] | null
  whiteLabel?: number | null
  wlMasterId?: number
  inPlaceId?: number | null
  lastLogin?: string | null
  updatedAt?: string | null
  createdAt: string
}

export interface IUsersQuery {
  limit: number
  offset: number
  status?: number
  role?: string
  search?: string
  parentId?: number
  createdAtStart?: string
  createdAtEnd?: string
  commissionLevelId?: number
}

export type IUsersFilters = Omit<IUsersQuery, 'limit' | 'offset'>

export interface IUsersPage {
  rows: IUser[]
  total: number
}

export interface IUserTree {
  root: IUser | null
  rows: IUser[]
}

export interface IUserFile {
  id: number
  url: string
  contentType: string
  size: number
  filename: string
}

export interface IChainUser {
  id: number
  name: string
  email: string
  document: string
  role: string
  roleName: string
  roleLevel: number
  status: number
}

export interface IContractStatus {
  id: number
  flowStatus: number
  signedAt: string | null
}

export interface IPermissionDef {
  id: number
  name: string
}

export interface IPermissionCatalog {
  permissions: IPermissionDef[]
  allowEffect?: number
}

export interface IFinanceLevel {
  id: number
  name: string
}

export interface IUserPayload {
  name?: string
  email?: string
  document?: string
  password?: string
  parentId?: number
  extraData: Record<string, unknown>
}

export interface ICreateUserPayload extends IUserPayload {
  role: string
  name: string
  email: string
  document: string
}

export interface IUpdateUserPayload extends IUserPayload {
  id: number
}

export interface IChangeStatusPayload {
  id: number
  status: number
  reason?: string
  allBelow?: boolean
}

export type BlockRuleType = 'role' | 'typingInactivity' | 'loginInactivity'

export interface IBlockRuleConfig {
  roleIds?: string[]
  days?: number
}

export interface IBlockRule {
  id: number
  name: string
  type: BlockRuleType
  config: IBlockRuleConfig
  active: boolean
  createdAt: string
  updatedAt?: string
}

export interface IBlockRulePayload {
  name: string
  type: BlockRuleType
  active: boolean
  config: IBlockRuleConfig
}
