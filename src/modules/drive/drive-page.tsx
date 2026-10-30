import { Suspense } from 'react'
import type { CelerisConfig } from '../../server/config'
import { DriveSection } from './drive-section'
import { DriveSkeleton } from './drive-skeleton'
import type { DrivePermissions } from './permissions'

interface DriveSearchParams {
  path?: string
}

export interface DrivePageProps {
  config: CelerisConfig
  permissions: () => Promise<DrivePermissions>
  basePath: string
  /** Aceito sem uso: a tela lê o `path` da URL no client */
  searchParams: Promise<DriveSearchParams>
}

async function DriveContent({ permissions, basePath }: DrivePageProps) {
  const perms = await permissions()

  return (
    <DriveSection
      basePath={basePath}
      canCreate={perms.canCreate}
      canUpdate={perms.canUpdate}
      canDelete={perms.canDelete}
    />
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
