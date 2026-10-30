'use client'

import { useRoles } from '../../../entities/roles/queries'
import { UserFormSkeleton } from '../list/skeletons'
import { UserCreateScreen, type UserCreateScreenProps } from './create-screen'

export function UserCreateLoader(props: UserCreateScreenProps) {
  const roles = useRoles()

  if (roles.isPending) return <UserFormSkeleton />
  if (roles.isError) return <p className="text-sm text-red-500">Não foi possível carregar os perfis.</p>

  return <UserCreateScreen {...props} />
}
