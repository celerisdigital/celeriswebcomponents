'use client'

import { useRoles } from '../../../entities/roles/queries'
import { useIsClient } from '../../../lib/use-is-client'
import { UserFormSkeleton } from '../list/skeletons'
import { UserCreateScreen, type UserCreateScreenProps } from './create-screen'

export function UserCreateLoader(props: UserCreateScreenProps) {
  const roles = useRoles()
  // O servidor sempre renderiza sem os perfis; no client eles podem já estar no cache quando o Suspense hidrata
  const isClient = useIsClient()

  if (!isClient || roles.isPending) return <UserFormSkeleton />
  if (roles.isError) return <p className="text-sm text-red-500">Não foi possível carregar os perfis.</p>

  return <UserCreateScreen {...props} />
}
