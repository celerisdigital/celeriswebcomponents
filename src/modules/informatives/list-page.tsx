import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import type { CelerisConfig } from '../../server/config'
import { CreateInformativeLink } from './create-link'
import { InformativesFilters } from './filters'
import { buildListQueries, type InformativesListSearchParams } from './list-queries'
import { InformativesListScreen } from './list-screen'
import { InformativesPageHeader } from './page-header'
import type { InformativesPermissions } from './permissions'
import { InformativesListSkeleton } from './skeletons'

export interface InformativesListPageProps {
  config: CelerisConfig
  permissions: () => Promise<InformativesPermissions>
  basePath: string
  backFallback: string
  deniedRedirect: string
  searchParams: Promise<InformativesListSearchParams>
}

async function CreateAction({
  permissions,
  basePath,
}: {
  permissions: Promise<InformativesPermissions>
  basePath: string
}) {
  const { canCreate } = await permissions
  if (!canCreate) return null

  return <CreateInformativeLink basePath={basePath} />
}

interface ListContentProps {
  permissions: Promise<InformativesPermissions>
  basePath: string
  deniedRedirect: string
  searchParams: Promise<InformativesListSearchParams>
}

async function ListContent({ permissions, basePath, deniedRedirect, searchParams }: ListContentProps) {
  const [perms, sp] = await Promise.all([permissions, searchParams])
  if (!perms.canRead) redirect(deniedRedirect)

  return (
    <InformativesListScreen
      basePath={basePath}
      queries={buildListQueries(sp)}
      canUpdate={perms.canUpdate}
      canDelete={perms.canDelete}
    />
  )
}

export function InformativesListPage({
  permissions,
  basePath,
  backFallback,
  deniedRedirect,
  searchParams,
}: InformativesListPageProps) {
  const permissionsPromise = permissions()

  return (
    <div className="p-6 flex flex-col gap-5">
      <InformativesPageHeader
        backFallback={backFallback}
        action={
          <Suspense fallback={null}>
            <CreateAction permissions={permissionsPromise} basePath={basePath} />
          </Suspense>
        }
      />
      <InformativesFilters />
      <Suspense fallback={<InformativesListSkeleton />}>
        <ListContent
          permissions={permissionsPromise}
          basePath={basePath}
          deniedRedirect={deniedRedirect}
          searchParams={searchParams}
        />
      </Suspense>
    </div>
  )
}
