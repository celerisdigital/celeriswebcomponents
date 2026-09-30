import { Suspense } from 'react'
import { HydrationBoundary, QueryClient, dehydrate } from '@tanstack/react-query'
import type { CelerisConfig } from '../../server/config'
import { createServerHttp } from '../../server/http'
import { driveKeys } from '../../query/keys'
import { prefetchRoleOptions } from '../../roles/api'
import { fetchDriveFiles, fetchDriveFolders } from './api'
import { parseDrivePath } from './breadcrumb'
import { DriveScreen } from './drive-screen'
import { DriveSkeleton } from './drive-skeleton'
import type { DrivePermissions } from './permissions'

interface DriveSearchParams {
  path?: string
}

export interface DrivePageProps {
  config: CelerisConfig
  permissions: () => Promise<DrivePermissions>
  basePath: string
  searchParams: Promise<DriveSearchParams>
}

async function DriveContent({ config, permissions, basePath, searchParams }: DrivePageProps) {
  const [sp, perms, http] = await Promise.all([searchParams, permissions(), createServerHttp(config)])
  const breadcrumb = parseDrivePath(sp.path)
  const currentFolderId = breadcrumb.length > 0 ? breadcrumb[breadcrumb.length - 1].id : undefined
  const queryClient = new QueryClient()

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: driveKeys.folders(currentFolderId),
      queryFn: () => fetchDriveFolders(http, currentFolderId),
    }),
    queryClient.prefetchQuery({
      queryKey: driveKeys.files(currentFolderId),
      queryFn: () => fetchDriveFiles(http, currentFolderId),
    }),
    prefetchRoleOptions(queryClient, http),
  ])

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DriveScreen
        key={sp.path ?? 'root'}
        basePath={basePath}
        initialBreadcrumb={breadcrumb}
        canCreate={perms.canCreate}
        canUpdate={perms.canUpdate}
        canDelete={perms.canDelete}
      />
    </HydrationBoundary>
  )
}

export function DrivePage(props: DrivePageProps) {
  return (
    <div className="p-6 flex flex-col gap-5">
      <h1 className="text-xl font-semibold text-gray-800">Arquivos</h1>
      <Suspense fallback={<DriveSkeleton />}>
        <DriveContent {...props} />
      </Suspense>
    </div>
  )
}
