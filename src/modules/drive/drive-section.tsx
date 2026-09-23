import { HydrationBoundary, QueryClient, dehydrate } from '@tanstack/react-query'
import { createHttpClient } from '../../http/create-client'
import { driveKeys } from '../../query/keys'
import type { RoleOption } from '../../types'
import { fetchDriveFiles, fetchDriveFolders } from './api'
import { parseDrivePath } from './breadcrumb'
import { DriveScreen } from './drive-screen'

export interface DriveSectionProps {
  token?: string
  apiBaseUrl: string
  basePath: string
  path?: string
  roles: RoleOption[]
  canCreate: boolean
  canUpdate: boolean
  canDelete: boolean
}

export async function DriveSection({
  token,
  apiBaseUrl,
  basePath,
  path,
  roles,
  canCreate,
  canUpdate,
  canDelete,
}: DriveSectionProps) {
  const breadcrumb = parseDrivePath(path)
  const currentFolderId = breadcrumb.length > 0 ? breadcrumb[breadcrumb.length - 1].id : undefined

  const http = createHttpClient({ baseUrl: apiBaseUrl, token })
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
  ])

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DriveScreen
        key={path ?? 'root'}
        basePath={basePath}
        initialBreadcrumb={breadcrumb}
        roles={roles}
        canCreate={canCreate}
        canUpdate={canUpdate}
        canDelete={canDelete}
      />
    </HydrationBoundary>
  )
}
