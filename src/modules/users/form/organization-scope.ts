import type { RoleFull } from '../../../entities/roles/types'
import type { OrganizationOption } from '../../../types'

export const SYSTEM_ORGANIZATION = ''

export function filterRolesByOrganization(roles: RoleFull[], organizationId: string) {
  const targetOrganizationId = organizationId === SYSTEM_ORGANIZATION ? null : Number(organizationId)

  return roles.filter((role) => (role.organizationId ?? null) === targetOrganizationId)
}

export function getOrganizationOptionLabel(organization: OrganizationOption) {
  return organization.active ? organization.name : `${organization.name} (inativa)`
}
