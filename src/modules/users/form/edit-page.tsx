import { Suspense } from 'react'
import { notFound, redirect } from 'next/navigation'
import { HydrationBoundary, QueryClient, dehydrate } from '@tanstack/react-query'
import type { CelerisConfig } from '../../../server/config'
import { createServerHttp } from '../../../server/http'
import { getViewer } from '../../../server/session'
import { userKeys } from '../../../query/keys'
import { prefetchRoles } from '../../../entities/roles/api'
import type { UserOption } from '../../../entities/users/types'
import { fetchFinanceLevels, fetchUser, fetchUserFiles } from '../api'
import { UsersPageHeader } from '../list/page-header'
import { UserFormSkeleton } from '../list/skeletons'
import type { UserEditPermissions } from '../permissions'
import type { IUserParent } from '../types'
import { UserEditScreen } from './edit-screen'

export interface UserEditPageProps {
  config: CelerisConfig
  permissions: () => Promise<UserEditPermissions>
  basePath: string
  deniedRedirect: string
  params: Promise<{ id: string }>
}

async function EditContent({ config, permissions, basePath, deniedRedirect, params }: UserEditPageProps) {
  const { id } = await params
  const userId = Number(id)

  if (!userId || Number.isNaN(userId)) notFound()

  const [perms, viewer, http] = await Promise.all([permissions(), getViewer(config), createServerHttp(config)])

  if (!perms.canUpdate || !viewer) redirect(deniedRedirect)

  const queryClient = new QueryClient()
  const [user] = await Promise.all([
    fetchUser(http, userId),
    prefetchRoles(queryClient, http),
    queryClient.prefetchQuery({ queryKey: userKeys.files(userId), queryFn: () => fetchUserFiles(http, userId) }),
    perms.canManageFinance
      ? queryClient.prefetchQuery({ queryKey: userKeys.financeLevels, queryFn: () => fetchFinanceLevels(http) })
      : null,
  ])

  if (!user) notFound()

  const directParent = (user.parents ?? []).reduce<IUserParent | null>(
    (closest, p) => (!closest || p.level < closest.level ? p : closest),
    null,
  )
  const initialBelowMe = directParent?.parentId === viewer.id
  let initialParentUser: UserOption | null = null

  if (directParent && !initialBelowMe) {
    const parent = await fetchUser(http, directParent.parentId)

    if (parent?.id) initialParentUser = { id: parent.id, name: parent.name, document: parent.document }
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <UserEditScreen
        key={userId}
        user={user}
        basePath={basePath}
        viewer={viewer}
        initialBelowMe={initialBelowMe}
        initialParentRoleId={directParent?.parentRole ?? ''}
        initialParentUser={initialParentUser}
        canMigrate={perms.canMigrate}
        canUpdateBankAccount={perms.canUpdateBankAccount}
        canManageFinance={perms.canManageFinance}
      />
    </HydrationBoundary>
  )
}

export function UserEditPage(props: UserEditPageProps) {
  return (
    <div className="p-6 max-w-3xl mx-auto flex flex-col gap-6">
      <UsersPageHeader title="Editar usuário" backFallback={props.basePath} />
      <Suspense fallback={<UserFormSkeleton />}>
        <EditContent {...props} />
      </Suspense>
    </div>
  )
}
