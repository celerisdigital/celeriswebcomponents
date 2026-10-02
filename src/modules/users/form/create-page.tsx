import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { HydrationBoundary, QueryClient, dehydrate } from '@tanstack/react-query'
import type { CelerisConfig } from '../../../server/config'
import { createServerHttp } from '../../../server/http'
import { getViewer } from '../../../server/session'
import { userKeys } from '../../../query/keys'
import { prefetchRoles } from '../../../entities/roles/api'
import { fetchFinanceLevels } from '../api'
import { UsersPageHeader } from '../list/page-header'
import { UserFormSkeleton } from '../list/skeletons'
import type { UserCreatePermissions } from '../permissions'
import { UserCreateScreen } from './create-screen'

export interface UserCreatePageProps {
  config: CelerisConfig
  permissions: () => Promise<UserCreatePermissions>
  basePath: string
  deniedRedirect: string
}

async function CreateContent({ config, permissions, basePath, deniedRedirect }: UserCreatePageProps) {
  const [perms, viewer, http] = await Promise.all([permissions(), getViewer(config), createServerHttp(config)])

  if (!perms.canCreate || !viewer) redirect(deniedRedirect)

  const queryClient = new QueryClient()

  await Promise.all([
    prefetchRoles(queryClient, http),
    perms.canManageFinance
      ? queryClient.prefetchQuery({ queryKey: userKeys.financeLevels, queryFn: () => fetchFinanceLevels(http) })
      : null,
  ])

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <UserCreateScreen
        basePath={basePath}
        viewer={viewer}
        canCreateHorizontal={perms.canCreateHorizontal}
        canManageFinance={perms.canManageFinance}
      />
    </HydrationBoundary>
  )
}

export function UserCreatePage(props: UserCreatePageProps) {
  return (
    <div className="p-6 max-w-3xl mx-auto flex flex-col gap-6">
      <UsersPageHeader title="Novo usuário" backFallback={props.basePath} />
      <Suspense fallback={<UserFormSkeleton />}>
        <CreateContent {...props} />
      </Suspense>
    </div>
  )
}
