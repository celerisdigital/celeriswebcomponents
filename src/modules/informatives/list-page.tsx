import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { HydrationBoundary, QueryClient, dehydrate } from '@tanstack/react-query'
import type { CelerisConfig } from '../../server/config'
import { createServerHttp } from '../../server/http'
import { informativeKeys } from '../../query/keys'
import { prefetchRoles } from '../../entities/roles/api'
import { fetchInformatives } from './api'
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
  config: CelerisConfig
  permissions: Promise<InformativesPermissions>
  basePath: string
  deniedRedirect: string
  searchParams: Promise<InformativesListSearchParams>
}

async function ListContent({ config, permissions, basePath, deniedRedirect, searchParams }: ListContentProps) {
  const [perms, sp, http] = await Promise.all([permissions, searchParams, createServerHttp(config)])
  if (!perms.canRead) redirect(deniedRedirect)

  const queries = buildListQueries(sp)
  const queryClient = new QueryClient()

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: informativeKeys.list(queries.active),
      queryFn: () => fetchInformatives(http, queries.active),
    }),
    queryClient.prefetchQuery({
      queryKey: informativeKeys.list(queries.expired),
      queryFn: () => fetchInformatives(http, queries.expired),
    }),
    prefetchRoles(queryClient, http),
  ])

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <InformativesListScreen
        basePath={basePath}
        queries={queries}
        canUpdate={perms.canUpdate}
        canDelete={perms.canDelete}
      />
    </HydrationBoundary>
  )
}

export function InformativesListPage({
  config,
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
          config={config}
          permissions={permissionsPromise}
          basePath={basePath}
          deniedRedirect={deniedRedirect}
          searchParams={searchParams}
        />
      </Suspense>
    </div>
  )
}
