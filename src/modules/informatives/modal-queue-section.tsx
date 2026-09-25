import { HydrationBoundary, QueryClient, dehydrate } from '@tanstack/react-query'
import { createHttpClient } from '../../http/create-client'
import { informativeKeys } from '../../query/keys'
import { fetchActiveInformatives } from './api'
import { InformativesModalQueue } from './modal-queue'

export interface InformativesModalQueueSectionProps {
  token?: string
  apiBaseUrl: string
}

export async function InformativesModalQueueSection({ token, apiBaseUrl }: InformativesModalQueueSectionProps) {
  const http = createHttpClient({ baseUrl: apiBaseUrl, token })
  const queryClient = new QueryClient()

  await queryClient.prefetchQuery({
    queryKey: informativeKeys.active,
    queryFn: () => fetchActiveInformatives(http),
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <InformativesModalQueue />
    </HydrationBoundary>
  )
}
