export interface UsersPermissions {
  canRead: boolean
  canViewDetail: boolean
  canCreate: boolean
  canCreateHorizontal: boolean
  canUpdate: boolean
  canUpdateBankAccount: boolean
  canDelete: boolean
  canExport: boolean
  canAnalyse: boolean
  canAssume: boolean
  canMigrate: boolean
  canManageFinance: boolean
  canCreateWhiteLabel: boolean
  canUpdateWhiteLabel: boolean
  canReadBlockRules: boolean
  canCreateBlockRule: boolean
  canUpdateBlockRule: boolean
  canDeleteBlockRule: boolean
}

export type UsersListPermissions = Pick<
  UsersPermissions,
  | 'canRead'
  | 'canViewDetail'
  | 'canCreate'
  | 'canCreateHorizontal'
  | 'canUpdate'
  | 'canDelete'
  | 'canExport'
  | 'canAnalyse'
  | 'canAssume'
  | 'canMigrate'
  | 'canManageFinance'
  | 'canCreateWhiteLabel'
  | 'canUpdateWhiteLabel'
  | 'canReadBlockRules'
>

export type UserCreatePermissions = Pick<UsersPermissions, 'canCreate' | 'canCreateHorizontal' | 'canManageFinance'>

export type UserEditPermissions = Pick<
  UsersPermissions,
  'canUpdate' | 'canUpdateBankAccount' | 'canMigrate' | 'canManageFinance'
>

export type UserBlockRulesPermissions = Pick<
  UsersPermissions,
  'canReadBlockRules' | 'canCreateBlockRule' | 'canUpdateBlockRule' | 'canDeleteBlockRule'
>
