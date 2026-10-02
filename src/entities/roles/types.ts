export interface RoleConfig {
  fields: {
    address?: boolean
    phone?: boolean
    bankAccount?: boolean
    attachments?: boolean
  }
  needBeAnalysed?: boolean
  canBePJ?: boolean
  needPutInPlace?: boolean
  maxParentLevel?: number | null
}

export interface RoleParent {
  id: number
  roleId: string
  parentId: string
  level: number
}

export interface RoleFull {
  id: string
  name: string
  level: number
  config: RoleConfig
  parents: RoleParent[]
}
