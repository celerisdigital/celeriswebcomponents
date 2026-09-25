import { HydrationBoundary, QueryClient, dehydrate } from '@tanstack/react-query'
import { createHttpClient } from '../../http/create-client'
import { informativeKeys } from '../../query/keys'
import type { RoleOption } from '../../types'
import { fetchInformatives } from './api'
import { InformativesListScreen } from './list-screen'

export interface InformativesListSectionProps {
  token?: string
  apiBaseUrl: string
  basePath: string
  backFallback: string
  roles: RoleOption[]
  limit: number
  offset: number
  title?: string
  canCreate: boolean
  canUpdate: boolean
  canDelete: boolean
}

export async function InformativesListSection({
  token,
  apiBaseUrl,
  basePath,
  backFallback,
  roles,
  limit,
  offset,
  title,
  canCreate,
  canUpdate,
  canDelete,
}: InformativesListSectionProps) {
  const query = { limit, offset, title }
  const http = createHttpClient({ baseUrl: apiBaseUrl, token })
  const queryClient = new QueryClient()

  await queryClient.prefetchQuery({
    queryKey: informativeKeys.list(query),
    queryFn: () => fetchInformatives(http, query),
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <InformativesListScreen
        basePath={basePath}
        backFallback={backFallback}
        roles={roles}
        query={query}
        canCreate={canCreate}
        canUpdate={canUpdate}
        canDelete={canDelete}
      />
    </HydrationBoundary>
  )
}
