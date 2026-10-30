'use client'

import { useSearchParams } from 'next/navigation'
import { parseDrivePath } from './breadcrumb'
import { DriveScreen } from './drive-screen'
import type { DrivePermissions } from './permissions'

interface Props extends DrivePermissions {
  basePath: string
}

export function DriveSection({ basePath, canCreate, canUpdate, canDelete }: Props) {
  const path = useSearchParams().get('path') ?? undefined

  return (
    <DriveScreen
      key={path ?? 'root'}
      basePath={basePath}
      initialBreadcrumb={parseDrivePath(path)}
      canCreate={canCreate}
      canUpdate={canUpdate}
      canDelete={canDelete}
    />
  )
}
