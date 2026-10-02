import type { RoleFull } from '../../../entities/roles/types'

export interface ParentContext {
  parentRoleOptions: RoleFull[]
  myRoleIsParent: boolean
  parentsCount: number
  parentRoleRequired: boolean
}

export function parentContextFor(role: RoleFull | null, roles: RoleFull[], myRoleId: string): ParentContext {
  const roleById = new Map(roles.map((r) => [r.id, r]))
  const parents = role?.parents ?? []
  const maxParentLevel = role?.config.maxParentLevel
  const hasLimit = maxParentLevel !== undefined && maxParentLevel !== null

  return {
    parentRoleOptions: parents
      .map((p) => roleById.get(p.parentId))
      .filter((r): r is RoleFull => r !== undefined && r.id !== role?.id && r.id !== myRoleId)
      .filter((r) => !hasLimit || r.level <= maxParentLevel),
    myRoleIsParent: parents.some((p) => p.parentId === myRoleId),
    parentsCount: parents.length,
    parentRoleRequired: hasLimit,
  }
}
