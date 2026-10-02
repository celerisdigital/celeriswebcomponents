import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { HydrationBoundary, QueryClient, dehydrate } from '@tanstack/react-query'
import type { CelerisConfig } from '../../../server/config'
import { createServerHttp } from '../../../server/http'
import { getViewer } from '../../../server/session'
import { userKeys } from '../../../query/keys'
import { prefetchRoles } from '../../../entities/roles/api'
import type { Viewer } from '../../../types'
import { fetchFinanceLevels, fetchUserTree, fetchUsers } from '../api'
import { UsersListProvider } from '../context'
import type { UsersListPermissions } from '../permissions'
import { TreeEmpty } from '../tree/tree-empty'
import { UserTreeScreen } from '../tree/tree-screen'
import { TreeSkeleton } from '../tree/tree-skeleton'
import { UsersFilters } from './filters'
import { UsersHeaderActions } from './header-actions'
import { UsersPageHeader } from './page-header'
import { buildUsersQuery, type UsersSearchParams } from './query'
import { UsersFiltersSkeleton, UsersTableSkeleton } from './skeletons'
import { UsersTable } from './users-table'
import { UsersViewTabs } from './view-tabs'

export interface UsersPageProps {
  config: CelerisConfig
  permissions: () => Promise<UsersListPermissions>
  basePath: string
  whiteLabelPath?: string
  backFallback: string
  deniedRedirect: string
  searchParams: Promise<UsersSearchParams>
}

interface ContentProps {
  config: CelerisConfig
  permissions: Promise<UsersListPermissions>
  viewer: Promise<Viewer | null>
  basePath: string
  whiteLabelPath?: string
  deniedRedirect: string
  searchParams: Promise<UsersSearchParams>
}

async function HeaderActions({ permissions, basePath }: { permissions: Promise<UsersListPermissions>; basePath: string }) {
  const perms = await permissions

  return (
    <UsersHeaderActions
      basePath={basePath}
      canReadBlockRules={perms.canReadBlockRules}
      canExport={perms.canExport}
      canCreate={perms.canCreate}
    />
  )
}

async function FiltersSection({ config, permissions, viewer }: ContentProps) {
  const [perms, currentViewer, http] = await Promise.all([permissions, viewer, createServerHttp(config)])

  if (!perms.canRead || !currentViewer) return null

  const queryClient = new QueryClient()

  await Promise.all([
    prefetchRoles(queryClient, http),
    perms.canManageFinance
      ? queryClient.prefetchQuery({ queryKey: userKeys.financeLevels, queryFn: () => fetchFinanceLevels(http) })
      : null,
  ])

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <UsersFilters
        canManageFinance={perms.canManageFinance}
        canCreateHorizontal={perms.canCreateHorizontal}
        viewerLevel={currentViewer.level}
      />
    </HydrationBoundary>
  )
}

async function ListContent({ config, permissions, viewer, basePath, whiteLabelPath, deniedRedirect, searchParams }: ContentProps) {
  const [perms, currentViewer, sp, http] = await Promise.all([permissions, viewer, searchParams, createServerHttp(config)])

  if (!perms.canRead || !currentViewer) redirect(deniedRedirect)

  const query = buildUsersQuery(sp)
  const queryClient = new QueryClient()

  await Promise.all([
    queryClient.fetchQuery({ queryKey: userKeys.list(query), queryFn: () => fetchUsers(http, query) }),
    prefetchRoles(queryClient, http),
  ])

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <UsersListProvider value={{ permissions: perms, viewer: currentViewer, basePath, whiteLabelPath }}>
        <UsersTable query={query} />
      </UsersListProvider>
    </HydrationBoundary>
  )
}

async function TreeContent({ config, permissions, viewer, basePath, whiteLabelPath, deniedRedirect, searchParams }: ContentProps) {
  const [perms, currentViewer, sp, http] = await Promise.all([permissions, viewer, searchParams, createServerHttp(config)])

  if (!perms.canRead || !currentViewer) redirect(deniedRedirect)

  if (!sp.parentId) return null

  const parentId = Number(sp.parentId)

  if (Number.isNaN(parentId)) return <TreeEmpty message="Hierarquia inválida." />

  const queryClient = new QueryClient()

  if (sp.view === 'arvore') {
    await Promise.all([
      queryClient.prefetchQuery({ queryKey: userKeys.tree(parentId), queryFn: () => fetchUserTree(http, parentId) }),
      prefetchRoles(queryClient, http),
    ])
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <UsersListProvider value={{ permissions: perms, viewer: currentViewer, basePath, whiteLabelPath }}>
        <UserTreeScreen key={parentId} parentId={parentId} />
      </UsersListProvider>
    </HydrationBoundary>
  )
}

export function UsersPage({
  config,
  permissions,
  basePath,
  whiteLabelPath,
  backFallback,
  deniedRedirect,
  searchParams,
}: UsersPageProps) {
  const permissionsPromise = permissions()
  const content: ContentProps = {
    config,
    permissions: permissionsPromise,
    viewer: getViewer(config),
    basePath,
    whiteLabelPath,
    deniedRedirect,
    searchParams,
  }

  return (
    <div className="p-6 flex flex-col gap-5">
      <UsersPageHeader
        title="Usuários"
        backFallback={backFallback}
        action={
          <Suspense fallback={null}>
            <HeaderActions permissions={permissionsPromise} basePath={basePath} />
          </Suspense>
        }
      />
      <UsersViewTabs
        tableSlot={
          <div className="flex flex-col gap-5">
            <Suspense fallback={<UsersFiltersSkeleton />}>
              <FiltersSection {...content} />
            </Suspense>
            <Suspense fallback={<UsersTableSkeleton />}>
              <ListContent {...content} />
            </Suspense>
          </div>
        }
        treeSlot={
          <Suspense fallback={<TreeSkeleton />}>
            <TreeContent {...content} />
          </Suspense>
        }
      />
    </div>
  )
}
