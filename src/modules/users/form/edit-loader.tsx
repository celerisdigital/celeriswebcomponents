'use client'

import { useRoles } from '../../../entities/roles/queries'
import type { UserOption } from '../../../entities/users/types'
import type { OrganizationOption, Viewer } from '../../../types'
import { UserFormSkeleton } from '../list/skeletons'
import { useUser } from '../queries'
import type { IUser, IUserParent } from '../types'
import { UserEditScreen } from './edit-screen'

interface Props {
  id: string
  basePath: string
  viewer: Viewer
  canMigrate: boolean
  canUpdateBankAccount: boolean
  canManageFinance: boolean
  organizationOptions: OrganizationOption[] | null
}

function parseId(id: string) {
  const numericId = Number(id)

  return Number.isInteger(numericId) && numericId > 0 ? numericId : null
}

function directParentOf(user: IUser) {
  return (user.parents ?? []).reduce<IUserParent | null>(
    (closest, p) => (!closest || p.level < closest.level ? p : closest),
    null,
  )
}

export function UserEditLoader({ id, viewer, ...screenProps }: Props) {
  const userId = parseId(id)
  const user = useUser(userId, { refetchOnMount: 'always' })
  const roles = useRoles()
  const directParent = user.data ? directParentOf(user.data) : null
  const initialBelowMe = directParent?.parentId === viewer.id
  // Superior que não é quem está logado: o formulário mostra o nome dele no seletor
  const parentId = directParent && !initialBelowMe ? directParent.parentId : null
  const parent = useUser(parentId)

  if (userId === null) return <p className="text-sm text-gray-500">Usuário não encontrado.</p>
  if (user.isError) return <p className="text-sm text-red-500">Não foi possível carregar o usuário.</p>
  if (roles.isError) return <p className="text-sm text-red-500">Não foi possível carregar os perfis.</p>
  if (!user.isFetchedAfterMount || roles.isPending) return <UserFormSkeleton />
  if (!user.data) return <p className="text-sm text-gray-500">Usuário não encontrado.</p>
  // Erro na busca do superior segue sem ele, como antes
  if (parentId !== null && parent.isPending) return <UserFormSkeleton />

  const initialParentUser: UserOption | null = parent.data?.id
    ? { id: parent.data.id, name: parent.data.name, document: parent.data.document }
    : null

  return (
    <UserEditScreen
      key={userId}
      user={user.data}
      viewer={viewer}
      initialBelowMe={initialBelowMe}
      initialParentRoleId={directParent?.parentRole ?? ''}
      initialParentUser={initialParentUser}
      {...screenProps}
    />
  )
}
