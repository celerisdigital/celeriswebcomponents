import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import type { CelerisConfig } from '../../../server/config'
import { getViewer } from '../../../server/session'
import type { Viewer } from '../../../types'
import { UsersListProvider } from '../context'
import type { UsersListPermissions } from '../permissions'
import { UsersTreeSection } from '../tree/tree-section'
import { TreeSkeleton } from '../tree/tree-skeleton'
import { UsersFilters } from './filters'
import { UsersHeaderActions } from './header-actions'
import { UsersPageHeader } from './page-header'
import type { UsersSearchParams } from './query'
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
  /** Aceito sem uso: a lista e a árvore leem a URL no client */
  searchParams: Promise<UsersSearchParams>
}

interface ContentProps {
  permissions: Promise<UsersListPermissions>
  viewer: Promise<Viewer | null>
  basePath: string
  whiteLabelPath?: string
  deniedRedirect: string
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

async function FiltersSection({ permissions, viewer }: ContentProps) {
  const [perms, currentViewer] = await Promise.all([permissions, viewer])

  if (!perms.canRead || !currentViewer) return null

  return (
    <UsersFilters
      canManageFinance={perms.canManageFinance}
      canCreateHorizontal={perms.canCreateHorizontal}
      viewerLevel={currentViewer.level}
    />
  )
}

async function ListContent({ permissions, viewer, basePath, whiteLabelPath, deniedRedirect }: ContentProps) {
  const [perms, currentViewer] = await Promise.all([permissions, viewer])

  if (!perms.canRead || !currentViewer) redirect(deniedRedirect)

  return (
    <UsersListProvider value={{ permissions: perms, viewer: currentViewer, basePath, whiteLabelPath }}>
      <UsersTable />
    </UsersListProvider>
  )
}

async function TreeContent({ permissions, viewer, basePath, whiteLabelPath, deniedRedirect }: ContentProps) {
  const [perms, currentViewer] = await Promise.all([permissions, viewer])

  if (!perms.canRead || !currentViewer) redirect(deniedRedirect)

  return (
    <UsersListProvider value={{ permissions: perms, viewer: currentViewer, basePath, whiteLabelPath }}>
      <UsersTreeSection />
    </UsersListProvider>
  )
}

export function UsersPage({ config, permissions, basePath, whiteLabelPath, backFallback, deniedRedirect }: UsersPageProps) {
  const permissionsPromise = permissions()
  const content: ContentProps = {
    permissions: permissionsPromise,
    viewer: getViewer(config),
    basePath,
    whiteLabelPath,
    deniedRedirect,
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
