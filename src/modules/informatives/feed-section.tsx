import { HydrationBoundary, QueryClient, dehydrate } from '@tanstack/react-query'
import { createHttpClient } from '../../http/create-client'
import { informativeKeys } from '../../query/keys'
import { fetchActiveInformatives } from './api'
import { InformativesFeedScreen } from './feed-screen'

export interface InformativesFeedSectionProps {
  token?: string
  apiBaseUrl: string
}

export async function InformativesFeedSection({ token, apiBaseUrl }: InformativesFeedSectionProps) {
  const http = createHttpClient({ baseUrl: apiBaseUrl, token })
  const queryClient = new QueryClient()

  await queryClient.prefetchQuery({
    queryKey: informativeKeys.active,
    queryFn: () => fetchActiveInformatives(http),
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <InformativesFeedScreen />
    </HydrationBoundary>
  )
}
