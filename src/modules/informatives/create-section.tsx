import type { RoleOption } from '../../types'
import { InformativeFormScreen } from './form-screen'

export interface InformativeCreateSectionProps {
  basePath: string
  roles: RoleOption[]
}

export function InformativeCreateSection({ basePath, roles }: InformativeCreateSectionProps) {
  return <InformativeFormScreen basePath={basePath} roles={roles} />
}
